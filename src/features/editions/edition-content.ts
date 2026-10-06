// Edition content now comes from the database: one DailyGame per row, one
// game released per day. Each game is a single "edition" with one node
// (the game itself) and multiple sub-stages (rounds).
//
// src/content/editions/*.json is only used as the seed source
// (prisma/seed-daily-games.ts), never read at runtime anymore.

import type { DailyGame } from "@prisma/client";
import { prisma } from "@/lib/db";
import { validateRoute } from "@/features/interactions/border-hop/border-hop-rules";
import { streakDayKey } from "@/features/streak/dates";
import type { Edition, EditionNode, Stage, StageType } from "@/types/gameplay";

/** Shape of DailyGame.content written by the seed: the game's rounds. */
export type DailyGameContent = {
  subStages: Array<Record<string, unknown>>;
  mapTitle?: string;
  mapSubtitle?: string;
  editionId?: string;
  editionTitle?: string;
};

export type DailyEdition = {
  /** The DailyGame row (one per day). */
  game: DailyGame;
  /** IST calendar day of the game, "YYYY-MM-DD" — used as the editionId. */
  dateKey: string;
  /** Derived Edition so existing UI keeps working. */
  edition: Edition;
};

let cache: { at: number; data: DailyEdition[] } | null = null;
const CACHE_TTL_MS = 30_000;

function dateKeyOf(game: DailyGame): string {
  return streakDayKey(game.scheduledFor);
}

function contentOf(game: DailyGame): DailyGameContent {
  const raw = game.content as unknown;
  if (raw && typeof raw === "object" && "subStages" in raw) {
    return raw as DailyGameContent;
  }
  // Tolerate a bare array of stages.
  if (Array.isArray(raw)) {
    return { subStages: raw as Array<Record<string, unknown>> };
  }
  return { subStages: [] };
}

/** Normalise raw sub-stages into engine Stage[] (field injection + validation). */
export function stagesFromDailyGame(game: DailyGame): Stage[] {
  const content = contentOf(game);
  const type = game.type as StageType;
  const mapTitle = content.mapTitle ?? game.title;
  const mapSubtitle = content.mapSubtitle ?? game.description ?? "";
  const rawStages = content.subStages ?? [];

  // A fill-blank-text game is ONE round with a deck of blanks, not N separate
  // rounds. Collapse the sub-stages into a single stage carrying `cards`.
  if (type === "fill-blank-text" && rawStages.length > 0) {
    const cards = rawStages.map((stage, index) => {
      const id =
        typeof stage.id === "string" && stage.id
          ? stage.id
          : `${game.id}-card-${index + 1}`;
      const blanks = Array.isArray(stage.blanks) ? stage.blanks : [];
      return {
        id,
        prompt: typeof stage.prompt === "string" ? stage.prompt : "",
        question:
          typeof stage.question === "string" ? stage.question : mapTitle,
        blanks,
        feedback: (stage.feedback as { correct?: string; incorrect?: string }) ?? {},
      };
    });
    const first = rawStages[0];
    const totalPoints = rawStages.reduce(
      (sum, s) => sum + (typeof s.points === "number" ? s.points : 0),
      0,
    );
    const round: Record<string, unknown> = {
      ...first,
      id: game.id, // one stable round id so interactionState is keyed to the whole deck
      type,
      mapTitle,
      mapSubtitle,
      question:
        typeof first.question === "string" ? first.question : "Fill in the blanks",
      introLabel:
        typeof first.introLabel === "string" ? first.introLabel : "Fill in the Blank",
      attemptsAllowed:
        typeof first.attemptsAllowed === "number" ? first.attemptsAllowed : 3,
      points: totalPoints,
      prompt: typeof first.prompt === "string" ? first.prompt : "",
      blanks: Array.isArray(first.blanks) ? first.blanks : [],
      cards,
    };
    return [round as Stage];
  }

  return rawStages.map((stage, index) => {
    const id =
      typeof stage.id === "string" && stage.id ? stage.id : `${game.id}-stage-${index + 1}`;
    const normalized: Record<string, unknown> = {
      ...stage,
      id,
      type,
      mapTitle,
      mapSubtitle,
      question: typeof stage.question === "string" ? stage.question : mapTitle,
      attemptsAllowed:
        typeof stage.attemptsAllowed === "number" ? stage.attemptsAllowed : 3,
      points: typeof stage.points === "number" ? stage.points : 100,
    };

    if (type === "border-hop") {
      const route = validateRoute({
        startCountry: normalized.startCountry as string,
        targetCountry: normalized.targetCountry as string,
        maxGuesses: normalized.maxGuesses as number | undefined,
        hintsAllowed: normalized.hintsAllowed as number | undefined,
      });
      normalized.startCountry = route.start;
      normalized.targetCountry = route.target;
    }

    return normalized as Stage;
  });
}

function toEdition(game: DailyGame, order: number): Edition {
  const dateKey = dateKeyOf(game);
  const node: EditionNode = {
    id: game.id,
    type: game.type,
    mapTitle: contentOf(game).mapTitle ?? game.title,
    mapSubtitle: contentOf(game).mapSubtitle ?? game.description ?? "",
    subStages: [] as Stage[],
  };
  return {
    id: dateKey, // one edition == one day == one game
    title: game.title,
    description: game.description ?? "",
    estimatedTime: `${stagesFromDailyGame(game).length} rounds`,
    order,
    theme: "salt-village",
    category: game.category ?? undefined,
    publishedAt: dateKey,
    weekLabel: new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(game.scheduledFor),
    coverImage: game.coverImage ?? undefined,
    nodes: [node],
  };
}

async function loadDailyGames(): Promise<DailyEdition[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const games = await prisma.dailyGame.findMany({
    where: { status: "published" },
    orderBy: { scheduledFor: "asc" },
  });

  const data: DailyEdition[] = games.map((game, index) => {
    const edition = toEdition(game, index + 1);
    edition.nodes[0].subStages = stagesFromDailyGame(game);
    return { game, dateKey: dateKeyOf(game), edition };
  });

  cache = { at: Date.now(), data };
  return data;
}

/** All published games, oldest day first (library/history). */
export async function getAllEditions(): Promise<DailyEdition[]> {
  return loadDailyGames();
}

/** Today's game (IST). Returns null if nothing is scheduled/published today. */
export async function getTodayEdition(now: Date = new Date()): Promise<DailyEdition | null> {
  const today = streakDayKey(now);
  return (await loadDailyGames()).find((e) => e.dateKey === today) ?? null;
}

/** Look an edition up by its dateKey (the editionId used in URLs). */
export async function getEditionById(editionId: string): Promise<DailyEdition | null> {
  return (await loadDailyGames()).find((e) => e.dateKey === editionId) ?? null;
}

/** The featured edition: today's game, else the most recent published day. */
export async function getFeaturedEdition(): Promise<DailyEdition | null> {
  const all = await loadDailyGames();
  return all[all.length - 1] ?? null;
}

/** The N most recent days that have a published game (profile history). */
export function lastDays(all: DailyEdition[], count: number): DailyEdition[] {
  return all.slice(-count);
}

/** Today's dateKey for URL building / "is this day reachable?" checks. */
export function todayKey(now: Date = new Date()): string {
  return streakDayKey(now);
}
