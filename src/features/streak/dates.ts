// features/streak/dates.ts
//
// All streak days are IST calendar days, represented as UTC-midnight Dates
// (which is what Prisma's @db.Date round-trips to).

export const STREAK_TZ = "Asia/Kolkata";
const DAY_MS = 864e5;

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: STREAK_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for the IST day containing `d`. */
export function streakDayKey(d: Date): string {
  return fmt.format(d);
}

export function dayKeyToDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

/** Today's IST day as a UTC-midnight Date. */
export function streakToday(now: Date = new Date()): Date {
  return dayKeyToDate(streakDayKey(now));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type StreakMetrics = {
  current: number;
  longest: number;
  struckToday: boolean;
};

/**
 * Derive streak lengths from distinct UTC-midnight dates returned by Prisma.
 * A streak remains live until the user misses a full IST calendar day.
 */
export function getStreakMetrics(days: readonly Date[], today: Date): StreakMetrics {
  const uniqueDays = [...new Set(days.map((day) => day.getTime()))].sort((a, b) => a - b);
  const todayMs = today.getTime();
  const yesterdayMs = addDays(today, -1).getTime();
  const struckToday = uniqueDays.includes(todayMs);

  let current = 0;
  let expected = struckToday ? todayMs : yesterdayMs;
  for (let i = uniqueDays.length - 1; i >= 0 && uniqueDays[i] === expected; i -= 1) {
    current += 1;
    expected -= DAY_MS;
  }

  let longest = 0;
  let run = 0;
  let previous: number | null = null;
  for (const day of uniqueDays) {
    run = previous !== null && day === previous + DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest, struckToday };
}
