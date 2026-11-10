import type { TimelineEvent } from "@/types/gameplay";

/** Ids of events already in a correct relative order (longest increasing chain by `order`). */
export function correctlyOrderedIds(placed: TimelineEvent[]): Set<string> {
  const n = placed.length;
  if (n === 0) return new Set();
  const len = new Array<number>(n).fill(1);
  const prev = new Array<number>(n).fill(-1);
  let best = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (placed[j].order < placed[i].order && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
    if (len[i] > len[best]) best = i;
  }
  const ids = new Set<string>();
  for (let k = best; k >= 0; k = prev[k]) ids.add(placed[k].id);
  return ids;
}

