import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import LibraryView, { type LibraryEdition } from "@/components/matchbox/library-view";
import { getAuthSession } from "@/lib/auth-session";
import { getEditionSummaries } from "@/features/editions/edition-content";

export default async function LibraryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const summaries = await getEditionSummaries();
  const editions: LibraryEdition[] = summaries.map((e, i) => ({
    id: e.id,
    title: e.title,
    category: e.category ?? "Featured",
    publishedAt: e.date,
    weekLabel: e.weekLabel,
    order: summaries.length - i, // oldest = 1; the list is newest-first
    games: e.gameCount,
    href: e.firstGameId ? `/edition/${e.id}/${e.firstGameId}` : "/map",
  }));

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page">
        <LibraryView editions={editions} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}