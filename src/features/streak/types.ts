/**
 * Contract for the streak block. The backend will eventually return this
 * exact shape, so the UI never changes when the data goes live.
 */
export type StreakDayState = "struck" | "today" | "missed" | "upcoming";

export type StreakDay = {
  /** ISO date, YYYY-MM-DD (UTC). The weekday letter is derived from this. */
  date: string;
  state: StreakDayState;
};

export type StreakData = {
  /** Current consecutive days struck. */
  current: number;
  /** Personal best. */
  best: number;
  /** Target for the Gold Box. */
  goal: number;
  /** Whether today's box is already struck. */
  struckToday: boolean;
  /** Last 7 days, oldest first, today last. */
  week: StreakDay[];
  stats: {
    accuracyPct: number;
    boxesStruck: number;
    gameTypes: number;
  };
};
