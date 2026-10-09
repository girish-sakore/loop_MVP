import type { StreakData, StreakDay } from "./types";

/**
 * Streak data source.
 *
 * STATIC FOR NOW: returns mock data. When the backend is ready, replace the
 * body with a DB query or a fetch to /api/streak that returns `StreakData`.
 * Keep the signature, and nothing else in the app needs to change.
 */
export async function getStreak(_userId: string): Promise<StreakData> {
  const DAY = 864e5;
  const now = Date.now();

  const week: StreakDay[] = Array.from({ length: 7 }, (_, k) => {
    const i = 6 - k; // days ago; k=6 is today
    return {
      date: new Date(now - i * DAY).toISOString().slice(0, 10),
      state: i === 0 ? "today" : "struck",
    };
  });

  return {
    current: 14,
    best: 21,
    goal: 21,
    struckToday: false,
    week,
    stats: { accuracyPct: 86, boxesStruck: 41, gameTypes: 6 },
  };
}
