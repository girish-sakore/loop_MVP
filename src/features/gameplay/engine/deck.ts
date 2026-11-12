import type { Stage } from "@/types/gameplay";

// Stage types the renderer shows as one multi-card screen.
export const DECK_TYPES = new Set<Stage["type"]>(["fill-blank-text"]);

export function deckStages(stages: Stage[], current: number): Stage[] {
  const type = stages[current]?.type;
  return type && DECK_TYPES.has(type) ? stages.filter((s) => s.type === type) : [];
}

/** Index to land on after Continue: past the whole deck, or +1 for normal stages. */
export function nextIndexAfterStage(stages: Stage[], current: number): number {
  const deck = deckStages(stages, current);
  if (!deck.length) return current + 1;
  const last = stages.lastIndexOf(deck[deck.length - 1]);
  return Math.max(last, current) + 1;
}