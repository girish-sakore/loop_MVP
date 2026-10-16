import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCreatorPage } from "@/lib/admin-page";
import { MobileContainer } from "@/components/layout/mobile-container";
import { SummaryHero } from "@/components/summary/summary-hero";
import { SummaryStats } from "@/components/summary/summary-stats";
import { ClosePreviewButton } from "@/components/admin/preview-buttons";

function EditionPlaceholder({ label }: { label: string }) {
  return (
    <div style={{ border: "2px dashed rgba(0,0,0,.35)", borderRadius: 12, padding: 20, textAlign: "center", fontSize: 13, opacity: 0.7 }}>
      {label}
    </div>
  );
}

export default async function PreviewSummaryPage({ params }: { params: Promise<{ gameId: string }> }) {
  await requireCreatorPage();
  const { gameId } = await params;
  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { title: true } });
  if (!game) notFound();

  return (
    <MobileContainer>
      <div style={{ padding: "8px 16px", fontSize: 13, background: "#ffd54a", color: "#111" }}>
        <b>Preview · summary screen</b>
      </div>
      <main className="flex flex-col gap-6 px-6 pt-4 pb-32">
        <SummaryHero editionTitle={`${game.title} (preview)`} />
        <SummaryStats totalStages={1} />
        <EditionPlaceholder label="Edition-linked content (next game, streak, share) appears here in the real summary" />
        <ClosePreviewButton fallback={`/admin/games/${gameId}`} />
      </main>
    </MobileContainer>
  );
}