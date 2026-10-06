import { notFound, redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getEditionById } from "@/features/editions/edition-content";
import { getGameProgress } from "@/features/gameplay/progress/daily-game-progress";
import { getAuthSession } from "@/lib/auth-session";

type PageProps = { params: Promise<{ editionId: string; nodeId: string }> };

export default async function NodeGameplayPage({ params }: PageProps) {
  // editionId == the game's IST dateKey ("YYYY-MM-DD"), nodeId == DailyGame.id.
  const { editionId, nodeId } = await params;

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const edition = await getEditionById(editionId);
  if (!edition || edition.game.id !== nodeId) notFound();

  const nodeProgress = await getGameProgress(session.user.id, edition.game);
  if (nodeProgress.status === "completed") redirect("/map");

  const node = edition.edition.nodes[0];
  const stages = node.subStages;

  return (
    <MobileContainer>
      <GameplayEngine
        editionId={edition.dateKey}
        nodeId={edition.game.id}
        stages={stages}
        initialStage={nodeProgress.currentSubStage}
        initialProgress={
          nodeProgress.status === "in_progress"
            ? {
                currentStage: nodeProgress.currentSubStage,
                attemptsRemaining:
                  nodeProgress.attemptsRemaining ??
                  (stages[nodeProgress.currentSubStage]?.attemptsAllowed ?? 0),
                stagePassed: nodeProgress.stagePassed,
                score: nodeProgress.score,
                correctAnswers: nodeProgress.correctAnswers,
                totalAnswers: nodeProgress.totalAnswers,
              }
            : undefined
        }
        userId={session.user.id}
      />
    </MobileContainer>
  );
}
