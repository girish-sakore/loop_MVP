import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import "../../marketing.css";
import Navbar from "@/components/layout/navbar-server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BlogReveal } from "@/components/summary/blog-reveal";
import { sanitizeAnswerResults } from "@/features/gameplay/progress/resume";
import { buildSummaryItems } from "@/features/summery/build-summary-items";

export default async function SummaryPage() {
  const edition = await getFeaturedEdition();
  if (!edition) redirect("/map");

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) redirect("/login"); // use whatever your sign-in route is

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

  const totalStages = edition.nodes.reduce(
    (sum, n) => sum + (n.subStages?.length ?? 1),
    0,
  );
  // totals reduce stays exactly as it is

  const resultsByNode = Object.fromEntries(
    rows.map((r) => [r.nodeId, sanitizeAnswerResults(r.answerResults)]),
  );
  const items = buildSummaryItems(edition.nodes, resultsByNode);
  return (
    <MobileContainer>
      <Navbar />
      {/* <Header /> */}
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
