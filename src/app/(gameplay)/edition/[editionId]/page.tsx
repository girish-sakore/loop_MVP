import { notFound, redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getEditionById } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { getUserEditionProgress } from "@/lib/edition-progress";

type PageProps = {
  params: Promise<{ editionId: string }>;
};

export default async function EditionGameplayPage({ params }: PageProps) {
  const { editionId } = await params;

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const edition = getEditionById(editionId);
  if (!edition) notFound();

  const progress = await getUserEditionProgress(session.user.id, edition.id);

  // If already completed, send back to current edition page
  if (progress.status === "completed") {
    redirect("/edition/current");
  }

  return (
    <MobileContainer>
      <GameplayEngine
        edition={edition}
        initialStage={progress.currentStage}
      />
    </MobileContainer>
  );
}