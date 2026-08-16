/**
 * 陳年卷宗 — UI：把 game.js 的純狀態畫成可點的現場。
 * 一切確認／輸入都在頁內完成（不使用 alert／confirm／prompt）。
 */

import { sceneArt } from "./art.js";
import { CaseAudio } from "./audio.js";
import {
  CASE_BRIEF,
  EVIDENCE,
  ITEMS,
  SCENES,
  SCENE_ORDER,
  SLOTS,
  SUSPECTS,
} from "./content.js";
import * as G from "./game.js";
import { loadProgress, mergeRecord, saveProgress } from "./persist.js";

const $ = (id) => document.getElementById(id);
const audio = new CaseAudio();

let state = G.createGame();
let record = { solved: 0, bestTurns: null, bestRating: null };
let pickerSlot = null;
let saveTimer = null;

/* ---------- 存檔 ---------- */

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveProgress({ save: G.serialize(state), record });
  }, 350);
}

function commitRecord() {
  record = mergeRecord(record, {
    phase: state.phase,
    turns: state.turns,
    rating: G.rating(state),
  });
}

/* ---------- 動作 ---------- */

function act(next) {
  const before = state.phase;
  state = next;
  const sound = state.event?.sound;
  if (sound) void audio.play(sound, sound === "solved" ? 0.7 : 1);
  if (before === "playing" && state.phase !== "playing") commitRecord();
  render();
  scheduleSave();
}

/* ---------- 畫面 ---------- */

const pendingHere = (sceneId) => G.pendingCount(state, sceneId);

function renderRooms() {
  const host = $("rooms");
  host.replaceChildren();
  for (const id of SCENE_ORDER) {
    const scene = SCENES[id];
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "room-tab";
    if (id === state.scene) tab.setAttribute("aria-current", "true");
    const left = pendingHere(id);
    tab.innerHTML =
      `<span>${scene.name}</span>` +
      (state.seen[id] && left > 0 ? `<span class="dot" aria-hidden="true"></span>` : "");
    tab.setAttribute(
      "aria-label",
      `${scene.name}${state.seen[id] && left > 0 ? `，還有 ${left} 處可查` : ""}`
    );
    tab.addEventListener("click", () => act(G.travel(state, id)));
    host.append(tab);
  }
}

function renderStage() {
  const scene = SCENES[state.scene];
  $("art").innerHTML = sceneArt(state.scene);
  $("scene-name").textContent = scene.name;

  const host = $("spots");
  host.replaceChildren();
  for (const spot of scene.hotspots) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "spot";
    button.style.left = `${spot.cx}%`;
    button.style.top = `${spot.cy}%`;
    button.style.width = `${spot.w}%`;
    button.style.height = `${spot.h}%`;
    button.dataset.done = String(!G.spotPending(state, state.scene, spot));
    button.dataset.armed = String(Boolean(state.selected));
    button.setAttribute(
      "aria-label",
      state.selected ? `對${spot.name}使用${ITEMS[state.selected].name}` : `搜查${spot.name}`
    );
    button.innerHTML = `<span class="label">${spot.name}</span>`;
    button.addEventListener("click", () => act(G.tapHotspot(state, spot.id)));
    host.append(button);
  }
}

function renderKeypad() {
  const box = $("keypad");
  if (!state.keypad) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const entry = state.keypad.entry;
  $("keypad-read").textContent = [0, 1, 2, 3].map((i) => entry[i] ?? "—").join(" ");
  const keys = $("keys");
  if (keys.childElementCount !== 10) {
    keys.replaceChildren();
    for (let digit = 0; digit <= 9; digit += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(digit);
      button.addEventListener("click", () => act(G.pressKey(state, digit)));
      keys.append(button);
    }
  }
}

function renderNarration() {
  const node = $("narration");
  node.textContent = state.event?.text ?? "";
  node.dataset.kind = state.event?.kind ?? "info";
}

function renderTutorial() {
  const text = G.tutorialText(state);
  const box = $("tutorial");
  box.hidden = !text;
  if (text) $("tutorial-text").textContent = text;
}

function renderItems() {
  const host = $("items");
  host.replaceChildren();
  if (state.inventory.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-bag";
    empty.textContent = "還沒收到任何東西。點現場的光點開始搜。";
    host.append(empty);
  }
  for (const id of state.inventory) {
    const item = ITEMS[id];
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item";
    button.setAttribute("aria-pressed", String(state.selected === id));
    button.innerHTML = `<span class="glyph" aria-hidden="true">${item.icon}</span><span class="name">${item.name}</span>`;
    button.addEventListener("click", () => act(G.tapItem(state, id)));
    li.append(button);
    host.append(li);
  }
  $("bag-hint").textContent = state.selected
    ? `拿著「${ITEMS[state.selected].name}」——點熱點使用，或點另一件證物組合`
    : "點證物選取，再點熱點使用；連點兩件可組合";
}

function evidenceCard(id, { pressed = null, onClick = null } = {}) {
  const data = EVIDENCE[id];
  const node = document.createElement(onClick ? "button" : "div");
  node.className = "evi";
  if (onClick) {
    node.type = "button";
    node.setAttribute("aria-pressed", String(Boolean(pressed)));
    node.addEventListener("click", onClick);
  }
  node.innerHTML =
    `<span class="evi-head"><strong>${data.name}</strong>` +
    `<span class="tag" data-tag="${data.tag}">${data.tag}</span></span>` +
    `<p>${data.note}</p>`;
  return node;
}

function renderFilePanel(body) {
  const brief = document.createElement("p");
  brief.className = "verdict-text";
  brief.textContent = CASE_BRIEF;
  body.append(brief);

  const stat = G.progress(state);
  const meta = document.createElement("p");
  meta.className = "section-title";
  meta.textContent = `已搜 ${stat.searched}／${stat.total} 處 · 推理卡 ${stat.evidence} 張 · 行動 ${state.turns} 次`;
  body.append(meta);

  const evTitle = document.createElement("p");
  evTitle.className = "section-title";
  evTitle.textContent = "推理卡";
  body.append(evTitle);

  const list = document.createElement("ul");
  list.className = "card-list";
  if (state.evidence.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-bag";
    li.textContent = "還沒有能上法庭的東西。";
    list.append(li);
  }
  for (const id of state.evidence) {
    const li = document.createElement("li");
    li.append(evidenceCard(id));
    list.append(li);
  }
  body.append(list);

  if (state.flags.knowsCast) {
    const who = document.createElement("p");
    who.className = "section-title";
    who.textContent = "關係人";
    body.append(who);
    body.append(suspectGrid({ interactive: false }));
  }

  const logTitle = document.createElement("p");
  logTitle.className = "section-title";
  logTitle.textContent = "調查日誌";
  body.append(logTitle);

  const log = document.createElement("ul");
  log.className = "log-list";
  for (const entry of [...state.log].reverse().slice(0, 8)) {
    const li = document.createElement("li");
    li.dataset.kind = entry.kind;
    li.textContent = entry.text;
    log.append(li);
  }
  body.append(log);
}

function suspectGrid({ interactive }) {
  const grid = document.createElement("div");
  grid.className = "suspects";
  for (const [id, person] of Object.entries(SUSPECTS)) {
    const node = document.createElement(interactive ? "button" : "div");
    node.className = "suspect";
    if (interactive) {
      node.type = "button";
      node.setAttribute("aria-pressed", String(state.accusation.suspect === id));
      node.addEventListener("click", () => act(G.setSuspect(state, id)));
    }
    node.innerHTML =
      `<span class="face" aria-hidden="true">${person.portrait}</span>` +
      `<span><span class="who">${person.name}</span><span class="role">${person.role}</span>` +
      `<span class="line">${person.line}</span></span>`;
    grid.append(node);
  }
  return grid;
}

function renderAccusePanel(body) {
  const who = document.createElement("p");
  who.className = "section-title";
  who.textContent = "一、指認對象";
  body.append(who, suspectGrid({ interactive: true }));

  const chain = document.createElement("p");
  chain.className = "section-title";
  chain.textContent = "二、證據鏈（點格子，再點下方推理卡）";
  body.append(chain);

  const slots = document.createElement("div");
  slots.className = "slots";
  for (const slot of SLOTS) {
    const picked = state.accusation.slots[slot.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot";
    button.setAttribute("aria-pressed", String(pickerSlot === slot.id));
    button.innerHTML =
      `<span class="slot-name">${slot.name}</span>` +
      `<span class="slot-value">${picked ? EVIDENCE[picked].name : "（空）"}</span>` +
      `<span class="slot-hint">${picked ? "再點一次可換掉" : slot.hint}</span>`;
    button.addEventListener("click", () => {
      if (picked) {
        pickerSlot = slot.id;
        act(G.assignSlot(state, slot.id, null));
        return;
      }
      pickerSlot = pickerSlot === slot.id ? null : slot.id;
      void audio.play("click");
      render();
    });
    slots.append(button);
  }
  body.append(slots);

  const pickTitle = document.createElement("p");
  pickTitle.className = "section-title";
  pickTitle.textContent = pickerSlot
    ? `把哪一張放進「${SLOTS.find((slot) => slot.id === pickerSlot).name}」？`
    : "三、手上的推理卡";
  body.append(pickTitle);

  const list = document.createElement("ul");
  list.className = "card-list";
  for (const id of state.evidence) {
    const li = document.createElement("li");
    const used = Object.values(state.accusation.slots).includes(id);
    li.append(
      evidenceCard(id, {
        pressed: used,
        onClick: pickerSlot
          ? () => {
              const slot = pickerSlot;
              pickerSlot = null;
              act(G.assignSlot(state, slot, id));
            }
          : null,
      })
    );
    list.append(li);
  }
  body.append(list);

  const strikes = document.createElement("p");
  strikes.className = "strikes";
  strikes.innerHTML =
    `<span>退件</span>` +
    [0, 1, 2].map((i) => `<i data-on="${i < state.strikes}"></i>`).join("") +
    `<span>${state.strikes}／${G.MAX_STRIKES}——第三次退件，卷宗封存。</span>`;
  body.append(strikes);

  const submit = document.createElement("button");
  submit.type = "button";
  submit.className = "primary";
  submit.textContent = "向檢察官提出指控";
  submit.addEventListener("click", () => {
    pickerSlot = null;
    act(G.accuse(state));
  });
  body.append(submit);
}

function renderVerdictPanel(body) {
  const won = state.phase === "won";
  const mark = document.createElement("p");
  mark.className = "verdict-mark";
  mark.dataset.lost = String(!won);
  mark.textContent = won ? "起訴・成立" : "封存";
  body.append(mark);

  const text = document.createElement("p");
  text.className = "verdict-text";
  text.textContent = state.event?.text ?? "";
  body.append(text);

  const stat = document.createElement("p");
  stat.className = "section-title";
  stat.textContent = won
    ? `評價 ${G.rating(state)} · 行動 ${state.turns} 次 · 退件 ${state.strikes} 次 · 分數 ${G.score(state)}`
    : `行動 ${state.turns} 次 · 退件 ${state.strikes} 次`;
  body.append(stat);

  const again = document.createElement("button");
  again.type = "button";
  again.className = "primary";
  again.textContent = won ? "重啟另一夜的調查" : "再查一次";
  again.addEventListener("click", () => {
    const fresh = G.skipTutorial(G.createGame());
    pickerSlot = null;
    act(fresh);
  });
  body.append(again);
}

function renderPanel() {
  const panel = $("panel");
  if (!state.panel) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const body = $("panel-body");
  body.replaceChildren();
  $("panel-title").textContent =
    state.panel === "file" ? "案件卷宗" : state.panel === "accuse" ? "指認" : "判決";
  if (state.panel === "file") renderFilePanel(body);
  else if (state.panel === "accuse") renderAccusePanel(body);
  else renderVerdictPanel(body);
  $("btn-panel-close").hidden = state.panel === "verdict";
}

function render() {
  renderRooms();
  renderStage();
  renderKeypad();
  renderNarration();
  renderTutorial();
  renderItems();
  renderPanel();
  $("file-count").textContent = String(state.evidence.length);
  $("btn-accuse").disabled = state.phase !== "playing";
}

/* ---------- 綁定 ---------- */

function bind() {
  $("btn-sound").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    button.setAttribute("aria-label", on ? "關閉音效" : "開啟音效");
    audio.setEnabled(on);
    if (on) void audio.playBgm();
  });

  $("btn-tut-next").addEventListener("click", () => {
    void audio.play("click");
    state = G.advanceTutorial(state);
    render();
    scheduleSave();
  });

  $("btn-tut-skip").addEventListener("click", () => {
    void audio.play("click");
    state = G.skipTutorial(state);
    render();
    scheduleSave();
  });

  $("btn-file").addEventListener("click", () => {
    pickerSlot = null;
    act(G.openPanel(state, "file"));
  });

  $("btn-accuse").addEventListener("click", () => {
    pickerSlot = null;
    act(G.openPanel(state, "accuse"));
  });

  $("btn-panel-close").addEventListener("click", () => {
    pickerSlot = null;
    act(G.closePanel(state));
  });

  $("keypad").addEventListener("click", (event) => {
    const key = event.target.closest("[data-key]")?.dataset.key;
    if (!key) return;
    if (key === "back") act(G.clearKey(state));
    else if (key === "close") act(G.closeKeypad(state));
    else act(G.submitCode(state));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.panel && state.phase === "playing") act(G.closePanel(state));
    else if (state.keypad) act(G.closeKeypad(state));
    else if (state.selected) act(G.tapItem(state, state.selected));
  });
}

async function enterGame() {
  await audio.unlock();
  void audio.playBgm();
  void audio.preload();
  $("intro").hidden = true;
  $("play").hidden = false;
  render();
}

async function boot() {
  $("brief").textContent = CASE_BRIEF;
  bind();
  render();

  const stored = await loadProgress();
  record = mergeRecord(stored.record, null);
  if (record.solved > 0) {
    const line = $("record");
    line.hidden = false;
    line.textContent = `已結案 ${record.solved} 次 · 最少行動 ${record.bestTurns} 次 · 最佳評價「${record.bestRating}」`;
  }

  const resumed = G.restore(stored.save);
  const worthResuming = resumed && resumed.phase === "playing" && resumed.turns > 0;
  if (worthResuming) {
    const button = $("btn-continue");
    button.hidden = false;
    button.textContent = `接續昨夜的調查（${SCENES[resumed.scene].name}・${resumed.turns} 個動作）`;
    button.addEventListener("click", () => {
      state = resumed;
      void enterGame();
    });
  }

  $("btn-start").addEventListener("click", () => {
    state = G.createGame();
    void enterGame();
  });
}

void boot();
