import { notFound, redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getAuthSession } from "@/lib/auth-session";
import { getUserNodeProgress } from "@/lib/edition-progress";
import type { Stage, StageType } from "@/types/gameplay";
import { getEditionById, getFeaturedEdition } from "@/features/editions/edition-content";
import { hasPremium } from "@/lib/premium";
import { sanitizeHintsUsed } from "@/features/gameplay/progress/resume";

type PageProps = {
  params: Promise<{ editionId: string; nodeId: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function NodeGameplayPage({ params, searchParams }: PageProps) {
  const { editionId, nodeId } = await params;
  const { mode } = await searchParams;
  const isReplay = mode === "replay";

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const [edition, featured] = await Promise.all([getEditionById(editionId), getFeaturedEdition()]);
  if (!edition) notFound();

  const premium = hasPremium(session.user);
  if (!premium && edition.id !== featured?.id) redirect("/pricing"); // archive is premium-only

  const nodeIndex = edition.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) notFound();

  const node = edition.nodes[nodeIndex];
  if (node.isPremium && !premium) redirect("/pricing"); // real enforcement; UI lock is cosmetic

  const nodeProgress = await getUserNodeProgress(session.user.id, editionId, nodeId);
  if (nodeProgress.status === "completed" && !isReplay) redirect("/map");

  const nodeType = node.type as StageType;
  const stages = node.subStages.map((stage, index) => ({
    ...stage,
    type: nodeType,
    mapTitle: node.mapTitle,
    mapSubtitle: node.mapSubtitle,
    question: "question" in stage ? stage.question : node.mapTitle,
    attemptsAllowed: "attemptsAllowed" in stage ? stage.attemptsAllowed : 3,
    points: "points" in stage ? stage.points : 100,
    id: stage.id ?? `${node.id}-stage-${index + 1}`,
  })) as Stage[];

  return (
    <MobileContainer>
      <GameplayEngine
        editionId={edition.id}
        nodeId={node.id}
        stages={stages}
        mode={isReplay ? "replay" : "normal"}
        initialStage={isReplay ? 0 : nodeProgress.currentSubStage}
        initialProgress={
          !isReplay && nodeProgress.status === "in_progress"
            ? {
              currentStage: nodeProgress.currentSubStage,
              attemptsRemaining:
                nodeProgress.attemptsRemaining ??
                (stages[nodeProgress.currentSubStage]?.attemptsAllowed ?? 0),
              stagePassed: nodeProgress.stagePassed,
              score: nodeProgress.score,
              correctAnswers: nodeProgress.correctAnswers,
              totalAnswers: nodeProgress.totalAnswers,
              hintsUsed: sanitizeHintsUsed(nodeProgress.hintsUsed),
            }
            : undefined
        }
        userId={session.user.id}
      />
    </MobileContainer>
  );
}
