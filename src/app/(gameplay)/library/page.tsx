import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import LibraryView, { type LibraryEdition } from "@/components/matchbox/library-view";
import { getAllEditions } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";

export default async function LibraryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  // Only plain, serialisable fields cross into the client component.
  const editions: LibraryEdition[] = getAllEditions().map((edition) => {
    const nodeId = edition.nodes[0]?.id;
    return {
      id: edition.id,
      title: edition.title,
      category: edition.category ?? "Featured",
      publishedAt: edition.publishedAt,
      weekLabel: edition.weekLabel,
      order: edition.order,
      games: edition.nodes.length,
      href: nodeId ? `/edition/${edition.id}/${nodeId}` : "/map",
    };
  });

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page">
        <LibraryView editions={editions} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}