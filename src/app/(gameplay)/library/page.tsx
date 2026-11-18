import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import LibraryView, { type LibraryEdition } from "@/components/matchbox/library-view";
import { getAuthSession } from "@/lib/auth-session";
import { getEditionSummaries } from "@/features/editions/edition-content";
import { hasPremium } from "@/lib/premium";
import { prisma } from "@/lib/db";

export default async function LibraryPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const summaries = await getEditionSummaries();
  const premium = hasPremium(session.user);

  // One query: which nodes has this user completed?
  const rows = await prisma.userNodeProgress.findMany({
    where: { userId: session.user.id, editionId: { in: summaries.map((s) => s.id) } },
    select: { editionId: true, nodeId: true, status: true },
  });
  const done = new Set(
    rows
      .filter((r) => r.status.toLowerCase() === "completed")
      .map((r) => `${r.editionId}:${r.nodeId}`),
  );

  const editions: LibraryEdition[] = summaries.map((e, i) => {
    // First game not completed: new games start, half-played games resume.
    const next = e.gameIds.find((id) => !done.has(`${e.id}:${id}`));
    const target = next ?? e.firstGameId;
    const base = target ? `/edition/${e.id}/${target}` : null;

    return {
      id: e.id,
      title: e.title,
      category: e.category ?? "Featured",
      publishedAt: e.date,
      weekLabel: e.weekLabel,
      order: summaries.length - i,
      games: e.gameCount,
      href: !base ? "/map" : next ? base : `${base}?mode=replay`, // all done: replay from the start
      locked: !premium && i > 0,
    };
  });

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page library-page">
        <LibraryView editions={editions} premiumUser={premium} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}