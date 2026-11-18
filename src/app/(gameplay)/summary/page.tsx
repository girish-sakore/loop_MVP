import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { getEditionById, getFeaturedEdition } from "@/features/editions/edition-content";
import { hasPremium } from "@/lib/premium";
import "../../marketing.css";
import Navbar from "@/components/layout/navbar-server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BlogReveal } from "@/components/summary/blog-reveal";
import { sanitizeAnswerResults } from "@/features/gameplay/progress/resume";
import { buildSummaryItems } from "@/features/summery/build-summary-items";

type PageProps = {
  searchParams: Promise<{ edition?: string | string[] }>;
};

export default async function SummaryPage({ searchParams }: PageProps) {
  const { edition: editionParam } = await searchParams;
  const requestedId = typeof editionParam === "string" ? editionParam : undefined;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login"); // login check first
  const userId = session.user.id;

  const featured = await getFeaturedEdition();
  const edition = requestedId ? await getEditionById(requestedId) : featured;
  if (!edition) redirect("/map");

  // archive is premium-only, same rule as the gameplay page
  if (edition.id !== featured?.id && !hasPremium(session.user)) redirect("/pricing");

  const rows = await prisma.userNodeProgress.findMany({
    where: { userId, editionId: edition.id, nodeId: { in: edition.nodes.map((n) => n.id) } },
    select: { nodeId: true, score: true, correctAnswers: true, totalAnswers: true, answerResults: true },
  });

  const totals = rows.reduce(
    (acc, r) => ({
      score: acc.score + r.score,
      correctAnswers: acc.correctAnswers + r.correctAnswers,
      totalAnswers: acc.totalAnswers + r.totalAnswers,
    }),
    { score: 0, correctAnswers: 0, totalAnswers: 0 },
  );

  const totalStages = edition.nodes.reduce((sum, n) => sum + (n.subStages?.length ?? 1), 0);

  const resultsByNode = Object.fromEntries(
    rows.map((r) => [r.nodeId, sanitizeAnswerResults(r.answerResults)]),
  );
  const items = buildSummaryItems(edition.nodes, resultsByNode);

  return (
    <MobileContainer>
      <Navbar />
      <main>
        <SummaryHero
          editionTitle={edition.title}
          totalStages={totalStages}
          category={edition.category ?? ""}
          {...totals}
        />
        <BlogReveal items={items} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}