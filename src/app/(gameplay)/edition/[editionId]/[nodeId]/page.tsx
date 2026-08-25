import { notFound, redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getEditionById } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { getUserEditionProgress, getUserNodeProgress } from "@/lib/edition-progress";
import type { StageType, Stage } from "@/types/gameplay";

type PageProps = { params: Promise<{ editionId: string; nodeId: string }> };

export default async function NodeGameplayPage({ params }: PageProps) {
  const { editionId, nodeId } = await params;

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const edition = getEditionById(editionId);
  if (!edition) notFound();

  const nodeIndex = edition.nodes.findIndex((n) => n.id === nodeId);
  if (nodeIndex === -1) notFound();

  const editionProgress = await getUserEditionProgress(session.user.id, editionId);

  // Server-side gate — mirrors map-node.tsx's isTappable check, but authoritative
  if (nodeIndex > editionProgress.currentNodeIndex) redirect("/map"); // locked
  if (nodeIndex < editionProgress.currentNodeIndex) redirect("/map"); // already completed, no replay yet

  const nodeProgress = await getUserNodeProgress(session.user.id, editionId, nodeId);
  const node = edition.nodes[nodeIndex];
  // const stages = node.subStages.map((s) => ({ ...s, type: node.type }));
  const stages = node.subStages.map((s) => {
    // Validate and cast node.type to StageType
    if (!["fill-blank", "multiple-choice", "drag-drop"].includes(node.type)) {
      throw new Error(`Invalid stage type: ${node.type}`);
    }
    const stageWithType = { ...s, type: node.type as StageType, };
    // console.log(node.id, stageWithType);
    return stageWithType as Stage;
  });

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