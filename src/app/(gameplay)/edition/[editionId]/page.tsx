import { notFound } from "next/navigation";

import { MobileContainer } from "@/components/layout/mobile-container";
import { GameplayEngine } from "@/features/gameplay/engine/gameplay-engine";
import { getEditionById } from "@/features/editions/edition-content";
import { getCachedAuthSession } from "@/lib/auth-session";

type PageProps = {
  params: Promise<{ editionId: string }> | { editionId: string };
};

export default async function EditionGameplayPage({ params }: PageProps) {
  const { editionId } = await Promise.resolve(params);
  const edition = getEditionById(editionId);

  if (!edition) {
    notFound();
  }

  // await requireUserSession(`/edition/${editionId}`);

  return (
    <MobileContainer>
      <GameplayEngine edition={edition} />
    </MobileContainer>
  );
}
