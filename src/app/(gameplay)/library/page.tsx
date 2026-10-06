import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import LibraryView, { type LibraryEdition } from "@/components/matchbox/library-view";
import { getAllEditions } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";

export default async function LibraryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  // One published day == one game. Only plain, serialisable fields cross into
  // the client component.
  const editions = await getAllEditions();
  const library: LibraryEdition[] = editions.map(({ game, edition, dateKey }) => {
    const rounds = edition.nodes[0]?.subStages.length ?? 0;
    return {
      id: dateKey,
      title: edition.title,
      category: edition.category ?? game.type,
      publishedAt: dateKey,
      weekLabel: edition.weekLabel,
      order: edition.order,
      games: rounds,
      href: `/edition/${dateKey}/${game.id}`,
    };
  });

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page">
        <LibraryView editions={library} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}