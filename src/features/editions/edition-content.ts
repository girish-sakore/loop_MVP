import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { dayString, parseDay, todayIST } from "@/lib/date-ist";
import type { Edition } from "@/types/gameplay";

const TAG = "editions";
const opts = { tags: [TAG], revalidate: 3600 }; // tag busts on admin changes; 1h is a safety net

// Latest live edition for a given IST day (today's, or the most recent past one).
const featuredForDay = unstable_cache(
  async (day: string) => {
    const row = await prisma.edition.findFirst({
      where: { status: "SCHEDULED", date: { lte: parseDay(day) } },
      orderBy: { date: "desc" },
      select: { snapshot: true },
    });
    return (row?.snapshot as unknown as Edition | null) ?? null;
  },
  ["featured-edition"],
  opts,
);

const editionRow = unstable_cache(
  async (id: string) => {
    const row = await prisma.edition.findUnique({
      where: { id },
      select: { status: true, date: true, snapshot: true },
    });
    if (!row || row.status !== "SCHEDULED" || !row.date || !row.snapshot) return null;
    return { date: dayString(row.date), edition: row.snapshot as unknown as Edition };
  },
  ["edition-by-id"],
  opts,
);

const weekFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

const summaries = unstable_cache(
  async (day: string) =>
    (
      await prisma.edition.findMany({
        where: { status: "SCHEDULED", date: { lte: parseDay(day) } },
        orderBy: { date: "desc" },
        select: {
          id: true, title: true, description: true, theme: true, category: true, coverImage: true, date: true,
          _count: { select: { games: true } },
          games: { select: { id: true }, orderBy: { position: "asc" }, take: 1 },
        },
        take: 365,
      })
    ).map(({ date, _count, games, ...e }) => ({
      ...e,
      date: dayString(date!),
      weekLabel: weekFmt.format(date!),
      gameCount: _count.games,
      firstGameId: games[0]?.id ?? null,
    })),
  ["edition-summaries"],
  opts,
);

export async function getFeaturedEdition(): Promise<Edition | null> {
  return featuredForDay(dayString(todayIST()));
}

/** Returns null for unknown, unscheduled, or not-yet-live editions. */
export async function getEditionById(editionId: string): Promise<Edition | null> {
  const row = await editionRow(editionId);
  if (!row || row.date > dayString(todayIST())) return null;
  return row.edition;
}

/** Light list (no games) for the library / archive. */
export async function getEditionSummaries() {
  return summaries(dayString(todayIST()));
}