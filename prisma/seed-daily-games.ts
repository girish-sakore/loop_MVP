/**
 * Seeds the daily_game table from the legacy JSON editions.
 *
 * One DailyGame row per former edition node. Each game is released on its own
 * day: games are sorted by GAME_ORDER (the canonical daily rotation) and
 * scheduled starting today. Games past their scheduled day keep their past
 * date (library/history), so the rotation keeps moving day by day.
 *
 * `content` holds the sub-stages of that node:
 *   { "subStages": [ ...stages with the node `type` injected... ] }
 *
 * NOTE: rerunning after the first publish is unsafe (the shape of
 * src/content/editions/*.json may have changed). Re-seed from scratch with:
 *   node --env-file=.env --experimental-strip-types prisma/seed-daily-games.ts --force
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const gamesDir = join(process.cwd(), "src/content/editions");

/** Same canonical rotation as src/lib/matchbox/game-order.ts (no @/ alias here). */
const GAME_ORDER = [
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

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

/** Same normalisation the old edition loader did (edition-content.ts). */
function normalizeStages(nodeType: string, subStages: Array<Record<string, unknown>>) {
  const stages: Array<Record<string, unknown>> = [];
  for (const [i, stage] of subStages.entries()) {
    if (nodeType === "clue-connect" && Array.isArray(stage.cases) && stage.cases.length > 1) {
      const cases = stage.cases as Array<Record<string, unknown>>;
      const baseId = stage.id ?? `stage-${i + 1}`;
      for (const [caseIndex, c] of cases.entries()) {
        stages.push({ ...stage, id: `${baseId}-${(c.id as string) || caseIndex + 1}`, cases: [c] });
      }
    } else {
      stages.push(stage);
    }
  }
  return stages;
}

type RawNode = {
  id: string;
  type: string;
  mapTitle?: string;
  mapSubtitle?: string;
  subStages: Array<Record<string, unknown>>;
};
type RawEdition = {
  id: string;
  title?: string;
  category?: string;
  coverImage?: string;
  nodes: RawNode[];
};

function loadEditions(): RawEdition[] {
  if (!existsSync(gamesDir)) {
    console.log(`[seed] ${gamesDir} not found — nothing to seed.`);
    process.exit(0);
  }
  return readdirSync(gamesDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(gamesDir, f), "utf8")) as RawEdition);
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const force = process.argv.includes("--force");

  const existing = await prisma.dailyGame.findFirst({ select: { id: true } });
  if (existing && !force) {
    console.log("[seed] daily_game already has rows. Rerun with --force to replace everything.");
    return;
  }

  const editions = loadEditions();

  type Game = {
    editionId: string;
    editionTitle: string;
    editionCategory?: string;
    coverImage?: string;
    type: string;
    title: string;
    mapTitle: string;
    mapSubtitle: string;
    stages: Array<Record<string, unknown>>;
  };

  // Flatten one game per node.
  const games: Game[] = [];
  for (const edition of editions) {
    for (const node of edition.nodes) {
      games.push({
        editionId: edition.id,
        editionTitle: edition.title ?? "Loop",
        editionCategory: edition.category,
        coverImage: edition.coverImage,
        type: node.type,
        title: node.mapTitle ?? node.type,
        mapTitle: node.mapTitle ?? node.type,
        mapSubtitle: node.mapSubtitle ?? "",
        stages: normalizeStages(node.type, node.subStages),
      });
    }
  }

  // One game per day, in the canonical rotation order.
  games.sort(
    (a, b) =>
      (GAME_ORDER.indexOf(a.type as (typeof GAME_ORDER)[number]) ?? 999) -
      (GAME_ORDER.indexOf(b.type as (typeof GAME_ORDER)[number]) ?? 999),
  );

  const today = startOfTodayUtc();
  const DAY_MS = 86_400_000;

  if (force) {
    await prisma.dailyGameProgress.deleteMany({});
    await prisma.dailyGame.deleteMany({});
    console.log("[seed] cleared existing daily_game + daily_game_progress rows.");
  }

  let created = 0;
  for (const [i, game] of games.entries()) {
    const scheduledFor = new Date(today.getTime() + i * DAY_MS);
    await prisma.dailyGame.upsert({
      where: { scheduledFor },
      update: {
        type: game.type,
        title: game.title,
        category: game.editionCategory ?? null,
        coverImage: game.coverImage ?? null,
        status: "published",
        content: {
          subStages: game.stages,
          mapTitle: game.mapTitle,
          mapSubtitle: game.mapSubtitle,
          editionId: game.editionId,
          editionTitle: game.editionTitle,
        } as object,
      },
      create: {
        type: game.type,
        title: game.title,
        description: game.mapSubtitle,
        category: game.editionCategory ?? null,
        coverImage: game.coverImage ?? null,
        scheduledFor,
        status: "published",
        content: {
          subStages: game.stages,
          mapTitle: game.mapTitle,
          mapSubtitle: game.mapSubtitle,
          editionId: game.editionId,
          editionTitle: game.editionTitle,
        } as object,
      },
    });
    created++;
    console.log(
      `[seed] ${isoDate(scheduledFor)}  ${game.type.padEnd(18)} ${game.title} (${game.stages.length} rounds)`,
    );
  }

  console.log(`[seed] done — ${created} daily games scheduled from ${isoDate(today)}.`);
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
