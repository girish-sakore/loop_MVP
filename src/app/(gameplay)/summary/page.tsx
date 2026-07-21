import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { SummaryHero } from "@/components/summary/summary-hero";
import { SummaryStats } from "@/components/summary/summary-stats";
import { SummaryActions } from "@/components/summary/summary-actions";
import { getFeaturedEdition } from "@/features/editions/edition-content";

export default function SummaryPage() {
  const edition = getFeaturedEdition();

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
        <SummaryStats totalStages={edition.stages.length} />
        <SummaryActions />
      </main>

      <BottomNav />
    </MobileContainer>
  );
}