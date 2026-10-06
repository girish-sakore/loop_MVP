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

/** A scheduled daily game can be played on its day and any later day. */
export function isGameAvailable(scheduledFor: Date, now: Date = new Date()): boolean {
  return streakDayKey(scheduledFor) <= streakDayKey(now);
}

/** A game counts only when its scheduled IST date is today's IST date. */
export function isGameScheduledForToday(scheduledFor: Date, now: Date = new Date()): boolean {
  return streakDayKey(scheduledFor) === streakDayKey(now);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
