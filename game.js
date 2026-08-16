/** pg-casefile — 陳年卷宗 (點選冒險) */

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function mulberry32(a) {
  return function() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function deep(o) { return JSON.parse(JSON.stringify(o)); }


export function createGame({ seed = 1 } = {}) {
  return { seed, turn: 0, score: 0, level: 1, meter: 0, resources: 10, flags: {}, log: ["陳年卷宗：查看／組合／指認"], outcome: "playing", msg: "陳年卷宗：查看／組合／指認" };
}
export function getLegalActions(s) {
  if (s.outcome !== "playing") return [];
  return ["look","take","combine","accuse"];
}
export function applyAction(state, action) {
  const s = deep(state);
  if (s.outcome !== "playing") return s;
  const rnd = mulberry32(s.seed + s.turn * 19);
  s.turn++;
  
  s.flags.inv = s.flags.inv ?? [];
  s.flags.clues = s.flags.clues ?? 0;
  if (action === "look") { s.flags.clues++; s.msg = "發現線索"; s.meter += 10; }
  else if (action === "take") { s.flags.inv.push("物"+(s.flags.inv.length+1)); s.msg = "放入背包"; s.score += 5; }
  else if (action === "combine") {
    if (s.flags.inv.length >= 2) { s.flags.inv.pop(); s.flags.clues += 2; s.meter += 20; s.msg = "組合成關鍵證據"; }
    else s.msg = "道具不足";
  } else {
    if (s.flags.clues >= 5) { s.level = 5; s.meter = 100; s.msg = "指認成功"; s.outcome = "playing"; }
    else { s.msg = "證據不足被趕出"; s.resources -= 2; }
  }

  if (s.resources < 0) s.resources = 0;
  if (s.outcome === "playing" && s.level >= 5 && s.meter >= 100) {
    s.outcome = "won";
    s.msg = "目標達成！";
  }
  if (s.outcome === "playing" && (s.resources <= 0 && s.meter < 20 && s.turn > 8)) {
    s.outcome = "lost";
    s.msg = "資源崩盤";
  }
  return s;
}
export function summarize(s) {
  return { turn: s.turn, level: s.level, meter: s.meter, score: s.score, resources: s.resources, msg: s.msg, outcome: s.outcome, flags: s.flags };
}
export function getOutcome(s) { return s.outcome; }

