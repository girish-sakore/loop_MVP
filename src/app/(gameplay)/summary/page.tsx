import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import "../../marketing.css";
import Navbar from "@/components/layout/navbar";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BlogReveal } from "@/components/summary/blog-reveal";

export default async function SummaryPage() {
  const edition = await getFeaturedEdition();
  if (!edition) redirect("/map");

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) redirect("/login"); // use whatever your sign-in route is

  const rows = await prisma.userNodeProgress.findMany({
    where: {
      userId,
      editionId: edition.id,
      nodeId: { in: edition.nodes.map((n) => n.id) },
    },
    select: { score: true, correctAnswers: true, totalAnswers: true },
  });

  const totals = rows.reduce(
    (acc, r) => ({
      score: acc.score + r.score,
      correctAnswers: acc.correctAnswers + r.correctAnswers,
      totalAnswers: acc.totalAnswers + r.totalAnswers,
    }),
    { score: 0, correctAnswers: 0, totalAnswers: 0 },
  );

  const totalStages = edition.nodes.reduce((sum, n) => {
    const subStages = n.subStages ?? [];
    if (subStages.length === 0) return sum + 1;

    return (
      sum +
      subStages.reduce(
        (s, sub) => s + (sub.type === "color-match" ? sub.clues.length : 1),
        0,
      )
    );
  }, 0);

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
        <BlogReveal />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
