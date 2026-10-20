const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
}); // en-CA formats as YYYY-MM-DD

/** Today's IST calendar day as a UTC-midnight Date, matching the @db.Date column. */
export function todayIST(): Date {
  return new Date(`${fmt.format(new Date())}T00:00:00.000Z`);
}
export function parseDay(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}
export const dayString = (d: Date) => d.toISOString().slice(0, 10);

export function isLive(e: { status: string; date: Date | null }) {
  return e.status === "SCHEDULED" && !!e.date && e.date <= todayIST();
}