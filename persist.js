/**
 * 進度持久化：一律走宿主的 `/api/kv`（禁止把 localStorage 當權威）。
 */

const KEY = "/api/kv/pg-casefile:progress";

export async function loadProgress(fetcher = fetch) {
  try {
    const res = await fetcher(KEY);
    if (!res.ok) return {};
    const text = await res.text();
    if (!text) return {};
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export async function saveProgress(data, fetcher = fetch) {
  try {
    await fetcher(KEY, { method: "PUT", body: JSON.stringify(data) });
  } catch {
    /* 離線時靜默略過，下一次動作會再試 */
  }
  return data;
}

/** 結案紀錄：破案次數、最少行動數、最佳評價。 */
export function mergeRecord(record, result) {
  const base = { solved: 0, bestTurns: null, bestRating: null, ...(record ?? {}) };
  if (!result || result.phase !== "won") return base;
  const better = base.bestTurns === null || result.turns < base.bestTurns;
  return {
    solved: base.solved + 1,
    bestTurns: better ? result.turns : base.bestTurns,
    bestRating: better ? result.rating : base.bestRating,
  };
}
