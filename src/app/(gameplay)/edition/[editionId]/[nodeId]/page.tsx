import { notFound, redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getEditionById } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { getUserNodeProgress } from "@/lib/edition-progress";
import type { Stage, StageType } from "@/types/gameplay";

type PageProps = { params: Promise<{ editionId: string; nodeId: string }> };

export default async function NodeGameplayPage({ params }: PageProps) {
  const { editionId, nodeId } = await params;

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const edition = await getEditionById(editionId);
  if (!edition) notFound();

  const nodeIndex = edition.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) notFound();

  const nodeProgress = await getUserNodeProgress(session.user.id, editionId, nodeId);
  if (nodeProgress.status === "completed") redirect("/map");

  const node = edition.nodes[nodeIndex];
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
        initialStage={nodeProgress.currentSubStage}
      />
    </MobileContainer>
  );
}
