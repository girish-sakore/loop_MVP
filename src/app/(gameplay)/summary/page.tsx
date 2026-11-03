import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import "../../marketing.css";
import { BlogReveal } from "@/components/summary/blog-reveal";
import Navbar from "@/components/layout/navbar";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  const totalStages = edition.nodes.reduce(
    (sum, n) => sum + (n.subStages?.length ?? 1),
    0,
  );

  return (
    <MobileContainer>
      <Navbar />
      <main>
        <SummaryHero
          editionTitle={edition.title}
          totalStages={totalStages}
          {...totals}
        />
        <BlogReveal />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}

