import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { SummaryStats } from "@/components/summary/summary-stats";
import { SummaryActions } from "@/components/summary/summary-actions";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import "../../marketing.css";
import { BlogReveal } from "@/components/summary/blog-reveal";
import { useGameplayStore } from "@/stores/gameplay-store";
import Navbar from "@/components/layout/navbar";



export default async function SummaryPage() {
  const edition = await getFeaturedEdition();
  if (!edition) redirect("/map");

  return (
    <MobileContainer>
      {/* Header */}
      <Navbar />
      <main className="">
        <SummaryHero editionTitle={edition.title} totalStages={edition.nodes.length} />
        <BlogReveal />
      </main>
      <BottomNav />
    </MobileContainer>
    
  );
}