import Link from "next/link";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { SummaryStats } from "@/components/summary/summary-stats";
import { SummaryActions } from "@/components/summary/summary-actions";
import { getFeaturedEdition } from "@/features/editions/edition-content";

type PageProps = { searchParams: Promise<{ gameKey?: string }> };

export default async function SummaryPage({ searchParams }: PageProps) {
  const edition = getFeaturedEdition();
  const { gameKey } = await searchParams;

  return (
    <MobileContainer>
      {/* Header */}
      <header
        className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2"
            style={{
              backgroundColor: "var(--surface-container-highest)",
              borderColor: "var(--surface-variant)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary)" }}
            >
              person
            </span>
          </div>
          <span
            className="text-[28px] font-extrabold tracking-tight"
            style={{ color: "var(--secondary)" }}
          >
            Loop
          </span>
        </div>
        <button
          className="material-symbols-outlined hover:opacity-70 transition-opacity"
          style={{ color: "var(--on-surface-variant)", fontSize: 24 }}
        >
          settings
        </button>
      </header>

      <main className="flex flex-col gap-6 px-6 pt-4 pb-32">
        <SummaryHero editionTitle={edition.title} />
        <SummaryStats totalStages={edition.nodes.length} />
        {gameKey ? (
          <Link
            href={`/daily/${gameKey}?replay=1`}
            className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              boxShadow: "0 4px 0 0 #2a4d41",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              replay
            </span>
            Play today&apos;s match again
          </Link>
        ) : null}
        <SummaryActions />
      </main>

      <BottomNav />
    </MobileContainer>
  );
}