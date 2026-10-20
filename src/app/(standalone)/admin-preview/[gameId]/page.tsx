import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCreatorPage } from "@/lib/admin-page";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { buildPreviewNode, SnapshotError } from "@/features/editions/snapshot";
import type { Stage, StageType } from "@/types/gameplay";
import { ClosePreviewButton } from "@/components/admin/preview-buttons";

export default async function PreviewPage({ params }: { params: Promise<{ gameId: string }> }) {
  const user = await requireCreatorPage();
  const { gameId } = await params;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) notFound();

  const back = `/admin/games/${game.id}`;
  const bar = (
    <div style={{ padding: "8px 16px", fontSize: 13, display: "flex", justifyContent: "space-between", background: "#ffd54a", color: "#111" }}>
      <b>Preview · progress is not saved</b>
      <ClosePreviewButton fallback={back} label="Exit" />
    </div>
  );

  let node;
  try {
    node = buildPreviewNode(game);
  } catch (e) {
    if (!(e instanceof SnapshotError)) throw e;
    const errors = (e.body.errors ?? []) as { path: string; message: string }[];
    return (
      <MobileContainer>
        {bar}
        <div style={{ padding: 16 }}>
          <b>This card has errors and can&apos;t be played yet:</b>
          <ul style={{ paddingLeft: 18 }}>{errors.map((x, i) => <li key={i}>{x.path}: {x.message}</li>)}</ul>
        </div>
      </MobileContainer>
    );
  }

  const stages = node.subStages.map((stage) => ({
    ...stage,
    type: node.type as StageType,
    mapTitle: node.mapTitle,
    mapSubtitle: node.mapSubtitle,
  })) as Stage[];

  return (
    <MobileContainer>
      {bar}
      <GameplayEngine
        editionId="preview"
        nodeId={game.id}
        stages={stages}
        userId={user.id}
        preview
        exitHref={back}
        summaryHref={`/admin-preview/${game.id}/summary`}
      />
    </MobileContainer>
  );
}