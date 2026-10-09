import type { RecentGame } from "./types";

/** STATIC FOR NOW: replace the body with a DB query or fetch when the backend is ready. */
export async function getRecentGames(_userId: string): Promise<RecentGame[]> {
  const DAY = 864e5;
  const now = Date.now();
  const day = (n: number) => new Date(now - n * DAY).toISOString().slice(0, 10);

  return [
    { id: "g42", editionNo: 42, gameType: "timeline-builder", gameLabel: "Chrono", topic: "Salt", playedAt: day(1), score: 3 },
    { id: "g41", editionNo: 41, gameType: "swipe", gameLabel: "This or That", topic: "Bridges", playedAt: day(2), score: 2 },
    { id: "g40", editionNo: 40, gameType: "color-match", gameLabel: "Palette", topic: "Tea", playedAt: day(3), score: 3 },
    { id: "g39", editionNo: 39, gameType: "image-select", gameLabel: "Knockout", topic: "Volcanoes", playedAt: day(4), score: 1 },
    { id: "g38", editionNo: 38, gameType: "drag-drop", gameLabel: "Links", topic: "Clocks", playedAt: day(5), score: 2 },
    { id: "g37", editionNo: 37, gameType: "four-way-swipe", gameLabel: "Compass", topic: "Silk Road", playedAt: day(6), score: 3 },
  ];
}