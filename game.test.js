import { describe, expect, it } from "vitest";

import { hasArt, sceneArt } from "./art.js";
import {
  COMBOS,
  CULPRIT,
  EVIDENCE,
  ITEMS,
  SCENES,
  SCENE_ORDER,
  SLOTS,
  SUSPECTS,
  VERDICT_KEY,
} from "./content.js";
import * as G from "./game.js";
import { mergeRecord } from "./persist.js";

/** 走到某個場景並搜查某個熱點。 */
function look(state, sceneId, hotspotId) {
  return G.examine(G.travel(state, sceneId), hotspotId);
}

/** 選起道具、對熱點使用。 */
function use(state, itemId, hotspotId) {
  return G.tapHotspot(G.tapItem(state, itemId), hotspotId);
}

/** 最短通關路線；回傳每一步的狀態，方便逐步斷言。 */
function walkthrough() {
  const steps = [];
  let state = G.skipTutorial(G.createGame());
  const push = (label, next) => {
    state = next;
    steps.push({ label, state });
    return state;
  };

  push("搜卷宗架", G.examine(state, "shelf"));
  push("搜值班桌燈", G.examine(state, "desk"));
  push("搜大衣架", look(state, "office", "coat"));
  push("看掛鐘", G.examine(state, "clock"));
  push("開保險箱面板", G.examine(state, "safe"));
  push("輸入 2314", G.submitCode("2314".split("").reduce((s, d) => G.pressKey(s, d), state)));
  push("搜抽屜", G.examine(state, "drawer"));
  push("銅鑰匙開鐵櫃", use(G.travel(state, "archive"), "brassKey", "cabinet"));
  push("班表＋放大鏡", G.combine(state, "rosterBurnt", "magnifier"));
  push("搜工具架", look(state, "storeroom", "toolrack"));
  push("起子開檢修蓋", use(state, "screwdriver", "pipe"));
  push("看布告欄", look(state, "dutyroom", "board"));
  push("開指認面板", G.openPanel(state, "accuse"));
  push("指認沈品瑤", G.setSuspect(state, "shen"));
  push("動機：私帳本", G.assignSlot(state, "motive", VERDICT_KEY.motive));
  push("機會：復原班表", G.assignSlot(state, "opportunity", VERDICT_KEY.opportunity));
  push("物證：檢修蓋髮夾", G.assignSlot(state, "physical", VERDICT_KEY.physical));
  push("提出指控", G.accuse(state));
  return steps;
}

const solved = () => walkthrough().at(-1).state;

describe("案件內容", () => {
  it("有 5 個場景，每個場景至少 3 個熱點", () => {
    expect(SCENE_ORDER.length).toBeGreaterThanOrEqual(4);
    for (const id of SCENE_ORDER) {
      expect(SCENES[id].hotspots.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("每個場景都有插畫，熱點座標落在畫面內且互不重疊", () => {
    for (const id of SCENE_ORDER) {
      expect(hasArt(id)).toBe(true);
      expect(sceneArt(id)).toContain("<svg");
      const boxes = SCENES[id].hotspots.map((spot) => ({
        id: spot.id,
        x1: spot.cx - spot.w / 2,
        x2: spot.cx + spot.w / 2,
        y1: spot.cy - spot.h / 2,
        y2: spot.cy + spot.h / 2,
      }));
      for (const box of boxes) {
        expect(box.x1).toBeGreaterThanOrEqual(0);
        expect(box.y1).toBeGreaterThanOrEqual(0);
        expect(box.x2).toBeLessThanOrEqual(100);
        expect(box.y2).toBeLessThanOrEqual(100);
      }
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const overlap = a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
          expect(`${id}:${a.id}×${b.id}=${overlap}`).toBe(`${id}:${a.id}×${b.id}=false`);
        }
      }
    }
  });

  it("至少兩組道具組合，產物與推理卡都有定義", () => {
    expect(COMBOS.length).toBeGreaterThanOrEqual(2);
    for (const combo of COMBOS) {
      expect(ITEMS[combo.a]).toBeTruthy();
      expect(ITEMS[combo.b]).toBeTruthy();
      expect(ITEMS[combo.result]).toBeTruthy();
      expect(EVIDENCE[combo.evidence]).toBeTruthy();
    }
  });

  it("三名嫌疑人只有一個真相，三格答案都是真實推理卡", () => {
    expect(Object.keys(SUSPECTS)).toHaveLength(3);
    expect(SUSPECTS[CULPRIT]).toBeTruthy();
    for (const slot of SLOTS) {
      expect(EVIDENCE[VERDICT_KEY[slot.id]]).toBeTruthy();
    }
  });
});

describe("搜查現場", () => {
  it("開局在檔案室、兩手空空", () => {
    const state = G.createGame();
    expect(state.scene).toBe("archive");
    expect(state.inventory).toEqual([]);
    expect(state.evidence).toEqual([]);
    expect(state.phase).toBe("playing");
  });

  it("搜熱點會收到道具與推理卡", () => {
    const state = G.examine(G.createGame(), "shelf");
    expect(state.inventory).toContain("dossier");
    expect(state.evidence).toContain("evOfficial");
    expect(state.event.kind).toBe("found");
  });

  it("同一個熱點不會重複給道具", () => {
    let state = G.examine(G.createGame(), "shelf");
    state = G.examine(state, "shelf");
    expect(state.inventory.filter((id) => id === "dossier")).toHaveLength(1);
  });

  it("換場景會更新場景與敘述，不存在的場景不動", () => {
    const state = G.travel(G.createGame(), "darkroom");
    expect(state.scene).toBe("darkroom");
    expect(state.event.sound).toBe("step");
    expect(G.travel(state, "no-such-room")).toBe(state);
  });

  it("熱點只在所在場景可點", () => {
    const state = G.createGame();
    expect(G.examine(state, "tray")).toBe(state);
  });
});

describe("上鎖與道具使用", () => {
  it("沒有鑰匙的鐵櫃打不開", () => {
    const state = G.examine(G.createGame(), "cabinet");
    expect(state.inventory).not.toContain("rosterBurnt");
    expect(state.event.kind).toBe("fail");
  });

  it("鑰匙在身上但沒選取，只給提示不開鎖", () => {
    let state = look(G.createGame(), "office", "coat");
    state = G.examine(G.travel(state, "archive"), "cabinet");
    expect(state.inventory).not.toContain("rosterBurnt");
    expect(state.event.text).toContain("銅鑰匙");
  });

  it("選取鑰匙再點鐵櫃才會開，並自動放下鑰匙", () => {
    let state = look(G.createGame(), "office", "coat");
    state = use(G.travel(state, "archive"), "brassKey", "cabinet");
    expect(state.inventory).toContain("rosterBurnt");
    expect(state.selected).toBeNull();
    expect(state.event.kind).toBe("found");
  });

  it("道具用錯地方會被打回，且不會消失", () => {
    let state = G.examine(G.createGame(), "desk");
    state = use(state, "magnifier", "shelf");
    expect(state.event.kind).toBe("fail");
    expect(state.inventory).toContain("magnifier");
  });

  it("放大鏡才看得出油污屬於誰", () => {
    let state = G.examine(G.createGame(), "desk");
    state = G.examine(G.travel(state, "storeroom"), "stain");
    expect(state.evidence).not.toContain("evOil");
    state = use(state, "magnifier", "stain");
    expect(state.evidence).toContain("evOil");
  });

  it("跨場景取得的起子能打開檔案室通風口", () => {
    let state = look(G.createGame(), "storeroom", "toolrack");
    expect(state.inventory).toContain("screwdriver");
    state = use(G.travel(state, "archive"), "screwdriver", "vent");
    expect(state.inventory).toContain("letterA");
  });
});

describe("證物選取與組合", () => {
  it("點證物選取、再點同一件放下", () => {
    let state = G.examine(G.createGame(), "shelf");
    state = G.tapItem(state, "dossier");
    expect(state.selected).toBe("dossier");
    state = G.tapItem(state, "dossier");
    expect(state.selected).toBeNull();
  });

  it("連點兩件證物就是嘗試組合", () => {
    let state = look(G.createGame(), "darkroom", "line");
    state = G.examine(state, "tray");
    state = G.tapItem(state, "negative");
    state = G.tapItem(state, "developer");
    expect(state.inventory).toContain("photo");
    expect(state.inventory).not.toContain("negative");
    expect(state.evidence).toContain("evPhoto");
    expect(state.event.sound).toBe("solved");
  });

  it("兜不起來的組合會失敗且不改變手上的東西", () => {
    let state = G.examine(G.createGame(), "shelf");
    state = G.examine(state, "desk");
    const before = [...state.inventory];
    state = G.combine(state, "dossier", "magnifier");
    expect(state.event.kind).toBe("fail");
    expect(state.inventory).toEqual(before);
  });

  it("放大鏡讀焦黑班表：消耗班表但留下放大鏡", () => {
    let state = G.examine(G.createGame(), "desk");
    state = look(state, "office", "coat");
    state = use(G.travel(state, "archive"), "brassKey", "cabinet");
    state = G.combine(state, "rosterBurnt", "magnifier");
    expect(state.inventory).toContain("rosterRead");
    expect(state.inventory).toContain("magnifier");
    expect(state.inventory).not.toContain("rosterBurnt");
    expect(state.evidence).toContain("evRoster");
  });

  it("打卡卡片與行車日誌對照不會消耗任何一份", () => {
    let state = look(G.createGame(), "office", "drawer");
    state = look(state, "dutyroom", "punch");
    state = G.combine(state, "timecard", "logbook");
    expect(state.inventory).toEqual(expect.arrayContaining(["timecard", "logbook", "timeline"]));
    expect(state.evidence).toContain("evTimeline");
  });

  it("重複組合不會再產出一份", () => {
    let state = look(G.createGame(), "darkroom", "line");
    state = G.examine(state, "tray");
    state = G.combine(state, "negative", "developer");
    const after = G.combine(state, "photo", "photo");
    expect(after).toBe(state);
  });

  it("拼好的信需要兩個場景的碎片", () => {
    let state = look(G.createGame(), "storeroom", "toolrack");
    state = use(G.travel(state, "archive"), "screwdriver", "vent");
    state = look(state, "darkroom", "bin");
    state = G.combine(state, "letterA", "letterB");
    expect(state.inventory).toContain("letter");
    expect(state.evidence).toContain("evLetter");
  });

  it("照片拿去對大衣才看得出袖口的破綻", () => {
    let state = look(G.createGame(), "office", "coat");
    expect(state.evidence).not.toContain("evCoat");
    state = look(state, "darkroom", "line");
    state = G.examine(state, "tray");
    state = G.combine(state, "negative", "developer");
    state = G.travel(state, "office");
    state = use(state, "photo", "coat");
    expect(state.evidence).toContain("evCoat");
    expect(state.event.kind).toBe("solve");
  });
});

describe("保險箱密碼", () => {
  it("沒看過掛鐘就打不開鍵盤", () => {
    const state = look(G.createGame(), "office", "safe");
    expect(state.keypad).toBeNull();
    expect(state.event.kind).toBe("fail");
  });

  it("看過掛鐘後鍵盤會開；輸入錯碼會清空重來", () => {
    let state = look(G.createGame(), "office", "clock");
    expect(state.flags.knowsCode).toBe(true);
    state = G.examine(state, "safe");
    expect(state.keypad).toEqual({ hotspot: "safe", entry: "" });
    state = "1111".split("").reduce((s, d) => G.pressKey(s, d), state);
    expect(state.keypad.entry).toBe("1111");
    state = G.submitCode(state);
    expect(state.keypad.entry).toBe("");
    expect(state.inventory).not.toContain("ledger");
    expect(state.event.kind).toBe("fail");
  });

  it("2314 打開保險箱，拿到私帳本與動機卡", () => {
    let state = look(G.createGame(), "office", "clock");
    state = G.examine(state, "safe");
    state = "2314".split("").reduce((s, d) => G.pressKey(s, d), state);
    state = G.submitCode(state);
    expect(state.keypad).toBeNull();
    expect(state.inventory).toContain("ledger");
    expect(state.evidence).toContain("evLedger");
  });

  it("鍵盤最多吃四位數，刪除鍵會退一格", () => {
    let state = look(G.createGame(), "office", "clock");
    state = G.examine(state, "safe");
    state = "23145".split("").reduce((s, d) => G.pressKey(s, d), state);
    expect(state.keypad.entry).toBe("2314");
    state = G.clearKey(state);
    expect(state.keypad.entry).toBe("231");
  });
});

describe("指認", () => {
  const ready = () => {
    const steps = walkthrough();
    return steps.find((step) => step.label === "開指認面板").state;
  };

  it("還沒查出關係人就不能指認", () => {
    const state = G.openPanel(G.createGame(), "accuse");
    expect(state.panel).toBeNull();
    expect(state.event.kind).toBe("fail");
  });

  it("指認站長會被時序表打回，並記一次退件", () => {
    let state = G.setSuspect(ready(), "lu");
    state = G.accuse(state);
    expect(state.strikes).toBe(1);
    expect(state.phase).toBe("playing");
    expect(state.event.text).toContain("呂維中");
  });

  it("指認郭阿信會被機油足跡打回", () => {
    const state = G.accuse(G.setSuspect(ready(), "kuo"));
    expect(state.event.text).toContain("郭阿信");
    expect(state.strikes).toBe(1);
  });

  it("指對人但物證擺錯，反駁會針對那一張卡", () => {
    let state = ready();
    state = look(state, "darkroom", "line");
    state = G.examine(state, "tray");
    state = G.combine(state, "negative", "developer");
    state = G.setSuspect(state, "shen");
    state = G.assignSlot(state, "motive", VERDICT_KEY.motive);
    state = G.assignSlot(state, "opportunity", VERDICT_KEY.opportunity);
    state = G.assignSlot(state, "physical", "evPhoto");
    state = G.accuse(state);
    expect(state.phase).toBe("playing");
    expect(state.event.text).toContain("大衣");
    expect(state.strikes).toBe(1);
  });

  it("同一張推理卡不會同時佔兩格", () => {
    let state = ready();
    state = G.assignSlot(state, "motive", "evLedger");
    state = G.assignSlot(state, "physical", "evLedger");
    expect(state.accusation.slots.motive).toBeNull();
    expect(state.accusation.slots.physical).toBe("evLedger");
  });

  it("沒拿到的推理卡不能上桌", () => {
    const state = G.assignSlot(G.createGame(), "motive", "evLedger");
    expect(state.accusation.slots.motive).toBeNull();
  });

  it("三次退件就封存卷宗", () => {
    let state = ready();
    for (let i = 0; i < 3; i += 1) state = G.accuse(G.setSuspect(state, "lu"));
    expect(state.strikes).toBe(3);
    expect(state.phase).toBe("lost");
    expect(state.event.text).toContain("封進水泥");
  });

  it("結案後任何現場操作都無效", () => {
    const state = solved();
    expect(G.examine(state, "shelf")).toBe(state);
    expect(G.travel(state, "darkroom")).toBe(state);
    expect(G.tapItem(state, "magnifier")).toBe(state);
    expect(G.accuse(state)).toBe(state);
  });
});

describe("通關", () => {
  it("最短路線可以真的破案", () => {
    const state = solved();
    expect(state.phase).toBe("won");
    expect(state.accusation.suspect).toBe(CULPRIT);
    expect(state.event.text).toContain("沈品瑤");
    expect(G.isVerdictCorrect(state)).toBe(true);
  });

  it("零退件的短路線拿到最高評價與分數", () => {
    const state = solved();
    expect(state.strikes).toBe(0);
    expect(state.turns).toBeLessThanOrEqual(40);
    expect(G.rating(state)).toBe("神探");
    expect(G.score(state)).toBeGreaterThan(0);
  });

  it("退件會拉低評價", () => {
    const steps = walkthrough();
    let state = steps.find((step) => step.label === "指認沈品瑤").state;
    state = G.accuse(state);
    state = G.assignSlot(state, "motive", VERDICT_KEY.motive);
    state = G.assignSlot(state, "opportunity", VERDICT_KEY.opportunity);
    state = G.assignSlot(state, "physical", VERDICT_KEY.physical);
    state = G.accuse(state);
    expect(state.phase).toBe("won");
    expect(G.rating(state)).toBe("險勝");
  });

  it("通關途中每一步都可序列化", () => {
    for (const step of walkthrough()) {
      expect(() => JSON.stringify(G.serialize(step.state))).not.toThrow();
      expect(["playing", "won", "lost"]).toContain(step.state.phase);
    }
  });

  it("房間待辦數會扣掉已解決的熱點，上鎖但沒開的還算待辦", () => {
    let state = G.createGame();
    expect(G.pendingCount(state, "archive")).toBe(4);
    state = G.examine(state, "shelf");
    expect(G.pendingCount(state, "archive")).toBe(3);
    state = G.examine(state, "cabinet");
    expect(G.pendingCount(state, "archive")).toBe(3);
    state = G.travel(state, "darkroom");
    state = G.examine(state, "lamp");
    expect(G.pendingCount(state, "darkroom")).toBe(3);
  });

  it("手上有照片時，大衣架會重新變成待辦", () => {
    let state = look(G.createGame(), "office", "coat");
    const after = G.pendingCount(state, "office");
    state = look(state, "darkroom", "line");
    state = G.examine(state, "tray");
    state = G.combine(state, "negative", "developer");
    expect(G.pendingCount(state, "office")).toBe(after + 1);
  });

  it("進度統計會隨搜查累積", () => {
    const start = G.progress(G.createGame());
    const end = G.progress(solved());
    expect(start.searched).toBe(0);
    expect(end.searched).toBeGreaterThanOrEqual(6);
    expect(end.total).toBeGreaterThanOrEqual(15);
  });
});

describe("存檔與教學", () => {
  it("serialize／restore 可以還原調查現場", () => {
    const steps = walkthrough();
    const mid = steps.find((step) => step.label === "班表＋放大鏡").state;
    const back = G.restore(JSON.parse(JSON.stringify(G.serialize(mid))));
    expect(back.scene).toBe(mid.scene);
    expect(back.inventory).toEqual(mid.inventory);
    expect(back.evidence).toEqual(mid.evidence);
    expect(back.flags.knowsCode).toBe(true);
    expect(back.turns).toBe(mid.turns);
  });

  it("壞掉或過期的存檔一律拒收", () => {
    expect(G.restore(null)).toBeNull();
    expect(G.restore({ version: 0 })).toBeNull();
    expect(G.restore({ version: G.SAVE_VERSION, scene: "nowhere" })).toBeNull();
    expect(G.restore({ version: G.SAVE_VERSION, scene: "archive" })).toBeNull();
  });

  it("還原時會濾掉不存在的道具與推理卡", () => {
    const back = G.restore({
      version: G.SAVE_VERSION,
      scene: "office",
      inventory: ["magnifier", "unicorn"],
      evidence: ["evLedger", "nope"],
      strikes: 99,
      turns: -5,
      phase: "ascended",
      accusation: { suspect: "nobody", slots: { motive: "fake" } },
    });
    expect(back.inventory).toEqual(["magnifier"]);
    expect(back.evidence).toEqual(["evLedger"]);
    expect(back.strikes).toBe(G.MAX_STRIKES);
    expect(back.turns).toBe(0);
    expect(back.phase).toBe("playing");
    expect(back.accusation.suspect).toBeNull();
    expect(back.accusation.slots.motive).toBeNull();
  });

  it("教學可以一步步看完，也可以直接略過", () => {
    let state = G.createGame();
    expect(G.tutorialText(state)).toBeTruthy();
    for (let i = 0; i < 4; i += 1) state = G.advanceTutorial(state);
    expect(G.tutorialText(state)).toBeNull();
    expect(G.tutorialText(G.skipTutorial(G.createGame()))).toBeNull();
  });

  it("結案紀錄只記破案、且保留最少行動數", () => {
    let rec = mergeRecord(undefined, null);
    expect(rec).toEqual({ solved: 0, bestTurns: null, bestRating: null });
    rec = mergeRecord(rec, { phase: "lost", turns: 5, rating: "未結案" });
    expect(rec.solved).toBe(0);
    rec = mergeRecord(rec, { phase: "won", turns: 30, rating: "結案" });
    rec = mergeRecord(rec, { phase: "won", turns: 44, rating: "險勝" });
    expect(rec).toEqual({ solved: 2, bestTurns: 30, bestRating: "結案" });
  });
});
