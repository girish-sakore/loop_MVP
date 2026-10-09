export const GAME_ORDER = [
  "swipe",
  "timeline-builder",
  "reorder",
  "four-way-swipe",
  "drag-drop",
  "image-select",
  "fill-blank",
  "color-match",
  "border-hop",
] as const;

export function themeIndexFor(gameType: string): number {
  return Math.max(0, (GAME_ORDER as readonly string[]).indexOf(gameType)) % 11;
}