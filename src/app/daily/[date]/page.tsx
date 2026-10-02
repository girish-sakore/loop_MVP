import { notFound, redirect } from "next/navigation";

import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { validateDailyGamePayload } from "@/lib/daily-game-validation";
import { getUserNodeProgress } from "@/lib/edition-progress";
import type { Stage, StageType } from "@/types/gameplay";

type PageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ replay?: string }>;
};

export default async function DailyGamePage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const scheduledFor = parseDate(date);
  if (!scheduledFor) notFound();

  const { replay } = await searchParams;
  const isReplay = replay === "1";

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  const game = await prisma.dailyGame.findUnique({ where: { scheduledFor } });
  if (!game || validateDailyGamePayload(game.type, game.payload).length > 0) notFound();

  // First play persists progress to the canonical row (editionId = nodeId =
  // game.id). Replays are ephemeral: they run the engine with `ephemeral` so
  // nothing is written to localStorage or the DB, and they therefore never
  // touch the first-play record (score/stars/completed).
  const stages = buildStages(game.type, game.payload);

  // A replay always starts fresh — no completed redirect, no seeded progress.
  if (isReplay) {
    return (
      <MobileContainer>
        <GameplayEngine
          editionId={game.id}
          nodeId={game.id}
          stages={stages}
          userId={session.user.id}
          gameKey={date}
          ephemeral
        />
      </MobileContainer>
    );
  }

  const progress = await getUserNodeProgress(session.user.id, game.id, game.id);
  if (progress.status === "completed") redirect("/map");

  return (
    <MobileContainer>
      <GameplayEngine
        editionId={game.id}
        nodeId={game.id}
        stages={stages}
        gameKey={date}
        initialStage={progress.currentSubStage}
        initialProgress={progress.status === "in_progress" ? {
          currentStage: progress.currentSubStage,
          attemptsRemaining: progress.attemptsRemaining ?? (stages[progress.currentSubStage]?.attemptsAllowed ?? 0),
          stagePassed: progress.stagePassed,
          score: progress.score,
          correctAnswers: progress.correctAnswers,
          totalAnswers: progress.totalAnswers,
        } : undefined}
        userId={session.user.id}
      />
    </MobileContainer>
  );
}

/** Expand a stored daily-game node (edition-node shape) into engine stages. */
function buildStages(type: string, payload: unknown): Stage[] {
  const data = payload as Record<string, unknown>;
  const nodeType = type as StageType;
  const subStages = Array.isArray(data.subStages) ? (data.subStages as unknown[]) : [];
  return subStages.map((raw, index) => {
    const sub = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
      ...sub,
      type: nodeType,
      id: typeof sub.id === "string" ? sub.id : `daily-stage-${index + 1}`,
      mapTitle: typeof data.mapTitle === "string" ? data.mapTitle : "Daily match",
      mapSubtitle: typeof data.mapSubtitle === "string" ? data.mapSubtitle : "A new Loop challenge.",
      question: typeof sub.question === "string" ? sub.question : "Ready to play?",
      attemptsAllowed: typeof sub.attemptsAllowed === "number" ? sub.attemptsAllowed : 3,
      points: typeof sub.points === "number" ? sub.points : 100,
    } as Stage;
  });
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}
