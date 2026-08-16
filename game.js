/**
 * 陳年卷宗 — 遊戲規則（純函式，無 DOM）。
 *
 * 全部操作都回傳新的 state，並在 `state.event` 標註要播的音效，
 * 讓 UI 只負責畫面與聲音，規則本身可以單獨測試。
 */

import {
  COMBOS,
  CULPRIT,
  EVIDENCE,
  ITEMS,
  REBUTTALS,
  SCENES,
  SCENE_ORDER,
  SLOTS,
  SUSPECTS,
  TUTORIAL,
  VERDICT_KEY,
  VERDICT_LOSE,
  VERDICT_WIN,
} from "./content.js";

export const SAVE_VERSION = 3;
export const MAX_STRIKES = 3;
const LOG_LIMIT = 24;

const SLOT_IDS = SLOTS.map((slot) => slot.id);

/** 熱點的全域鍵。 */
export function hotspotKey(sceneId, hotspotId) {
  return `${sceneId}.${hotspotId}`;
}

export function findHotspot(sceneId, hotspotId) {
  const scene = SCENES[sceneId];
  if (!scene) return null;
  return scene.hotspots.find((spot) => spot.id === hotspotId) ?? null;
}

export function createGame() {
  return {
    version: SAVE_VERSION,
    scene: SCENE_ORDER[0],
    seen: { [SCENE_ORDER[0]]: true },
    spots: {},
    inventory: [],
    evidence: [],
    flags: { knowsCode: false, knowsCast: false },
    selected: null,
    keypad: null,
    panel: null,
    accusation: { suspect: null, slots: { motive: null, opportunity: null, physical: null } },
    strikes: 0,
    turns: 0,
    phase: "playing",
    tutorial: 0,
    log: [{ text: SCENES[SCENE_ORDER[0]].line, kind: "info" }],
    event: { sound: null, text: SCENES[SCENE_ORDER[0]].line, kind: "info" },
  };
}

function clone(state) {
  return {
    ...state,
    seen: { ...state.seen },
    spots: Object.fromEntries(Object.entries(state.spots).map(([k, v]) => [k, { ...v }])),
    inventory: [...state.inventory],
    evidence: [...state.evidence],
    flags: { ...state.flags },
    keypad: state.keypad ? { ...state.keypad } : null,
    accusation: {
      suspect: state.accusation.suspect,
      slots: { ...state.accusation.slots },
    },
    log: [...state.log],
  };
}

function emit(state, text, kind = "info", sound = null) {
  state.event = { sound, text, kind };
  state.log = [...state.log, { text, kind }].slice(-LOG_LIMIT);
  return state;
}

function spotOf(state, key) {
  return state.spots[key] ?? { examined: 0, cleared: false };
}

function giveItem(state, itemId) {
  if (!itemId || state.inventory.includes(itemId)) return false;
  state.inventory = [...state.inventory, itemId];
  return true;
}

function addEvidence(state, evidenceId) {
  if (!evidenceId || state.evidence.includes(evidenceId)) return false;
  state.evidence = [...state.evidence, evidenceId];
  return true;
}

function itemName(itemId) {
  return ITEMS[itemId]?.name ?? itemId;
}

/** 熱點的收穫：道具、推理卡、旗標。回傳附加說明。 */
function collect(state, spot) {
  const extra = [];
  if (spot.gives && giveItem(state, spot.gives)) extra.push(`〔收存〕${itemName(spot.gives)}`);
  if (spot.evidence && addEvidence(state, spot.evidence)) {
    extra.push(`〔卷宗〕${EVIDENCE[spot.evidence].name}`);
  }
  if (spot.sets) state.flags = { ...state.flags, [spot.sets]: true };
  return extra;
}

function tryBonus(state, spot) {
  const bonus = spot.bonus;
  if (!bonus) return null;
  if (state.evidence.includes(bonus.evidence)) return null;
  if (!bonus.needs.every((need) => state.inventory.includes(need))) return null;
  addEvidence(state, bonus.evidence);
  return `${bonus.text}\n〔卷宗〕${EVIDENCE[bonus.evidence].name}`;
}

export function travel(state, sceneId) {
  if (state.phase !== "playing" || !SCENES[sceneId]) return state;
  if (state.scene === sceneId) return state;
  const next = clone(state);
  next.scene = sceneId;
  next.seen = { ...next.seen, [sceneId]: true };
  next.keypad = null;
  next.turns += 1;
  return emit(next, `${SCENES[sceneId].name}——${SCENES[sceneId].line}`, "info", "step");
}

/** 點熱點：手上有選取的證物就是「使用」，否則就是「搜查」。 */
export function tapHotspot(state, hotspotId) {
  if (state.phase !== "playing") return state;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot) return state;
  if (state.selected) return useItem(state, state.selected, hotspotId);
  return examine(state, hotspotId);
}

export function examine(state, hotspotId) {
  if (state.phase !== "playing") return state;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot) return state;

  const next = clone(state);
  const key = hotspotKey(next.scene, hotspotId);
  const record = spotOf(next, key);
  next.spots = { ...next.spots, [key]: { examined: record.examined + 1, cleared: record.cleared } };
  next.turns += 1;

  if (spot.keypad && !record.cleared) {
    if (spot.keypad.needs && !next.flags[spot.keypad.needs]) {
      return emit(next, `${spot.look}\n${spot.keypad.needsText}`, "fail", "error");
    }
    next.keypad = { hotspot: hotspotId, entry: "" };
    return emit(next, `${spot.look}`, "info", "click");
  }

  if (spot.requires && !record.cleared) {
    const held = next.inventory.includes(spot.requires);
    const text = held
      ? `${spot.lockedText}\n（手上的${itemName(spot.requires)}也許派得上用場——先點它，再點這裡。）`
      : spot.lockedText;
    return emit(next, text, held ? "info" : "fail", held ? "click" : "error");
  }

  if (record.cleared || record.examined > 0) {
    const bonus = tryBonus(next, spot);
    if (bonus) return emit(next, bonus, "solve", "found");
    return emit(next, spot.repeat ?? spot.look, "info", "click");
  }

  const extra = collect(next, spot);
  if (spot.gives || spot.evidence || spot.sets) {
    next.spots = { ...next.spots, [key]: { examined: record.examined + 1, cleared: true } };
  }
  const bonus = tryBonus(next, spot);
  if (bonus) extra.push(bonus);
  const found = extra.length > 0;
  return emit(
    next,
    [spot.look, ...extra].join("\n"),
    found ? "found" : "info",
    found ? spot.sound ?? "found" : spot.sound ?? "click"
  );
}

export function useItem(state, itemId, hotspotId) {
  if (state.phase !== "playing") return state;
  if (!state.inventory.includes(itemId)) return state;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot) return state;

  const next = clone(state);
  const key = hotspotKey(next.scene, hotspotId);
  const record = spotOf(next, key);
  next.turns += 1;

  if (spot.requires === itemId && !record.cleared) {
    next.spots = { ...next.spots, [key]: { examined: record.examined + 1, cleared: true } };
    next.selected = null;
    const extra = collect(next, spot);
    return emit(next, [spot.useText, ...extra].join("\n"), "found", spot.sound ?? "found");
  }

  if (spot.bonus && spot.bonus.needs.includes(itemId)) {
    const bonus = tryBonus(next, spot);
    if (bonus) {
      next.selected = null;
      return emit(next, bonus, "solve", "found");
    }
  }

  if (spot.keypad && !record.cleared) {
    return emit(next, `「${itemName(itemId)}」開不了電子鎖。這裡要的是四個數字。`, "fail", "error");
  }

  return emit(next, `「${itemName(itemId)}」在${spot.name}上派不上用場。`, "fail", "error");
}

/** 點證物：第一下選取，點第二件就嘗試組合，點同一件取消。 */
export function tapItem(state, itemId) {
  if (state.phase !== "playing") return state;
  if (!state.inventory.includes(itemId)) return state;
  if (state.selected === itemId) {
    const next = clone(state);
    next.selected = null;
    return emit(next, `放下${itemName(itemId)}。`, "info", "click");
  }
  if (state.selected) return combine(state, state.selected, itemId);
  const next = clone(state);
  next.selected = itemId;
  return emit(next, `${ITEMS[itemId].desc}\n（拿著它點熱點＝使用；點另一件證物＝組合。）`, "info", "click");
}

export function findCombo(a, b) {
  return (
    COMBOS.find(
      (combo) => (combo.a === a && combo.b === b) || (combo.a === b && combo.b === a)
    ) ?? null
  );
}

export function combine(state, a, b) {
  if (state.phase !== "playing") return state;
  if (a === b) return state;
  if (!state.inventory.includes(a) || !state.inventory.includes(b)) return state;

  const next = clone(state);
  next.turns += 1;
  next.selected = null;
  const combo = findCombo(a, b);
  if (!combo) {
    return emit(next, `${itemName(a)}與${itemName(b)}兜不起來。`, "fail", "error");
  }
  if (next.inventory.includes(combo.result)) {
    return emit(next, `${itemName(combo.result)}已經在卷宗裡了。`, "info", "click");
  }

  next.inventory = next.inventory.filter((id) => !combo.consumes.includes(id));
  giveItem(next, combo.result);
  const lines = [combo.text, `〔收存〕${itemName(combo.result)}`];
  if (addEvidence(next, combo.evidence)) lines.push(`〔卷宗〕${EVIDENCE[combo.evidence].name}`);
  return emit(next, lines.join("\n"), "solve", "solved");
}

/* ---------- 保險箱鍵盤 ---------- */

export function pressKey(state, digit) {
  if (!state.keypad || state.phase !== "playing") return state;
  const spot = findHotspot(state.scene, state.keypad.hotspot);
  if (!spot?.keypad) return state;
  if (state.keypad.entry.length >= spot.keypad.length) return state;
  const next = clone(state);
  next.keypad = { ...next.keypad, entry: next.keypad.entry + String(digit) };
  next.event = { sound: "click", text: next.event.text, kind: "info" };
  return next;
}

export function clearKey(state) {
  if (!state.keypad) return state;
  const next = clone(state);
  next.keypad = { ...next.keypad, entry: next.keypad.entry.slice(0, -1) };
  next.event = { sound: "click", text: next.event.text, kind: "info" };
  return next;
}

export function closeKeypad(state) {
  if (!state.keypad) return state;
  const next = clone(state);
  next.keypad = null;
  return next;
}

export function submitCode(state) {
  if (!state.keypad || state.phase !== "playing") return state;
  const hotspotId = state.keypad.hotspot;
  const spot = findHotspot(state.scene, hotspotId);
  if (!spot?.keypad) return state;

  const next = clone(state);
  const key = hotspotKey(next.scene, hotspotId);
  const record = spotOf(next, key);
  next.turns += 1;

  if (next.keypad.entry !== spot.keypad.code) {
    next.keypad = { ...next.keypad, entry: "" };
    return emit(next, spot.keypad.failText, "fail", "error");
  }

  next.keypad = null;
  next.spots = { ...next.spots, [key]: { examined: record.examined, cleared: true } };
  const lines = [spot.keypad.okText];
  if (giveItem(next, spot.keypad.gives)) lines.push(`〔收存〕${itemName(spot.keypad.gives)}`);
  if (addEvidence(next, spot.keypad.evidence)) {
    lines.push(`〔卷宗〕${EVIDENCE[spot.keypad.evidence].name}`);
  }
  return emit(next, lines.join("\n"), "solve", "solved");
}

/* ---------- 指認 ---------- */

export function canAccuse(state) {
  return Boolean(state.flags.knowsCast);
}

export function openPanel(state, panel) {
  if (panel === "accuse" && !canAccuse(state)) {
    const blocked = clone(state);
    return emit(blocked, "你連關係人是誰都還沒查清。值班室的布告欄有當年的人事公告。", "fail", "error");
  }
  const next = clone(state);
  next.panel = panel;
  next.selected = null;
  next.keypad = null;
  return next;
}

export function closePanel(state) {
  const next = clone(state);
  next.panel = null;
  return next;
}

export function setSuspect(state, suspectId) {
  if (!SUSPECTS[suspectId] || state.phase !== "playing") return state;
  const next = clone(state);
  next.accusation = { ...next.accusation, suspect: suspectId };
  next.event = { sound: "click", text: SUSPECTS[suspectId].line, kind: "info" };
  return next;
}

export function assignSlot(state, slotId, evidenceId) {
  if (!SLOT_IDS.includes(slotId) || state.phase !== "playing") return state;
  if (evidenceId !== null && !state.evidence.includes(evidenceId)) return state;
  const next = clone(state);
  const slots = { ...next.accusation.slots };
  // 同一張推理卡只能放在一格。
  for (const id of SLOT_IDS) if (slots[id] === evidenceId) slots[id] = null;
  slots[slotId] = evidenceId;
  next.accusation = { ...next.accusation, slots };
  next.event = { sound: "click", text: next.event.text, kind: "info" };
  return next;
}

function rebuttalFor(state) {
  const { suspect, slots } = state.accusation;
  if (!suspect) return REBUTTALS.suspect.none;
  if (suspect !== CULPRIT) return REBUTTALS.suspect[suspect];
  for (const slotId of SLOT_IDS) {
    const picked = slots[slotId];
    if (picked === VERDICT_KEY[slotId]) continue;
    const table = REBUTTALS[slotId];
    if (!picked) return table.empty;
    return table[picked] ?? table.other;
  }
  return REBUTTALS.suspect.none;
}

export function isVerdictCorrect(state) {
  const { suspect, slots } = state.accusation;
  if (suspect !== CULPRIT) return false;
  return SLOT_IDS.every((slotId) => slots[slotId] === VERDICT_KEY[slotId]);
}

export function accuse(state) {
  if (state.phase !== "playing") return state;
  const next = clone(state);
  next.turns += 1;

  if (isVerdictCorrect(next)) {
    next.phase = "won";
    next.panel = "verdict";
    return emit(next, VERDICT_WIN, "verdict", "solved");
  }

  next.strikes += 1;
  const text = rebuttalFor(next);
  if (next.strikes >= MAX_STRIKES) {
    next.phase = "lost";
    next.panel = "verdict";
    return emit(next, `${text}\n\n${VERDICT_LOSE}`, "verdict", "error");
  }
  return emit(next, `${text}\n（退件 ${next.strikes}／${MAX_STRIKES}）`, "fail", "error");
}

/* ---------- 教學／評價／存檔 ---------- */

export function advanceTutorial(state) {
  const next = clone(state);
  next.tutorial = Math.min(TUTORIAL.length, next.tutorial + 1);
  return next;
}

export function skipTutorial(state) {
  const next = clone(state);
  next.tutorial = TUTORIAL.length;
  return next;
}

export function tutorialText(state) {
  return state.tutorial < TUTORIAL.length ? TUTORIAL[state.tutorial] : null;
}

export function score(state) {
  if (state.phase !== "won") return 0;
  return Math.max(50, 1000 - state.turns * 10 - state.strikes * 200);
}

export function rating(state) {
  if (state.phase !== "won") return "未結案";
  if (state.strikes === 0 && state.turns <= 40) return "神探";
  if (state.strikes === 0) return "結案";
  if (state.strikes === 1) return "險勝";
  return "驚險過關";
}

/** 這個熱點還有沒有事可做（含手上道具剛好能觸發的追加線索）。 */
export function spotPending(state, sceneId, spot) {
  const record = spotOf(state, hotspotKey(sceneId, spot.id));
  const rewarding = Boolean(
    spot.gives || spot.evidence || spot.sets || spot.keypad || spot.requires
  );
  if (rewarding && !record.cleared) return true;
  if (
    spot.bonus &&
    !state.evidence.includes(spot.bonus.evidence) &&
    spot.bonus.needs.every((need) => state.inventory.includes(need))
  ) {
    return true;
  }
  return record.examined === 0;
}

export function pendingCount(state, sceneId) {
  return SCENES[sceneId].hotspots.filter((spot) => spotPending(state, sceneId, spot)).length;
}

export function progress(state) {
  const total = SCENE_ORDER.reduce((sum, id) => sum + SCENES[id].hotspots.length, 0);
  const done = Object.values(state.spots).filter((spot) => spot.examined > 0).length;
  return { searched: done, total, evidence: state.evidence.length, keys: Object.keys(EVIDENCE).length };
}

export function evidenceCards(state) {
  return state.evidence.map((id) => ({ id, ...EVIDENCE[id] }));
}

export function serialize(state) {
  return {
    version: SAVE_VERSION,
    scene: state.scene,
    seen: state.seen,
    spots: state.spots,
    inventory: state.inventory,
    evidence: state.evidence,
    flags: state.flags,
    accusation: state.accusation,
    strikes: state.strikes,
    turns: state.turns,
    phase: state.phase,
    tutorial: state.tutorial,
    log: state.log.slice(-6),
  };
}

export function restore(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version !== SAVE_VERSION) return null;
  if (!SCENES[raw.scene]) return null;
  if (!Array.isArray(raw.inventory) || !Array.isArray(raw.evidence)) return null;
  const base = createGame();
  const slots = raw.accusation?.slots ?? {};
  return {
    ...base,
    scene: raw.scene,
    seen: { ...base.seen, ...(raw.seen ?? {}) },
    spots: raw.spots && typeof raw.spots === "object" ? raw.spots : {},
    inventory: raw.inventory.filter((id) => ITEMS[id]),
    evidence: raw.evidence.filter((id) => EVIDENCE[id]),
    flags: { ...base.flags, ...(raw.flags ?? {}) },
    accusation: {
      suspect: SUSPECTS[raw.accusation?.suspect] ? raw.accusation.suspect : null,
      slots: Object.fromEntries(
        SLOT_IDS.map((id) => [id, EVIDENCE[slots[id]] ? slots[id] : null])
      ),
    },
    strikes: Number.isFinite(raw.strikes) ? Math.min(MAX_STRIKES, Math.max(0, raw.strikes)) : 0,
    turns: Number.isFinite(raw.turns) ? Math.max(0, raw.turns) : 0,
    phase: ["playing", "won", "lost"].includes(raw.phase) ? raw.phase : "playing",
    tutorial: Number.isFinite(raw.tutorial) ? raw.tutorial : 0,
    log: Array.isArray(raw.log) && raw.log.length ? raw.log : base.log,
  };
}
