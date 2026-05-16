import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { EditionHero } from "@/components/edition-intro/edition-hero";
import { EditionProgress } from "@/components/edition-intro/edition-progress";
import { EditionFocus } from "@/components/edition-intro/edition-focus";
import { EditionCta } from "@/components/edition-intro/edition-cta";
import { EditionCompleted } from "@/components/edition-intro/edition-completed";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { getUserEditionProgress } from "@/lib/edition-progress";

export default async function CurrentEditionPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const edition = getFeaturedEdition();
  const progress = await getUserEditionProgress(
    session.user.id,
    edition.id,
  );

  return (
    <MobileContainer>
      {/* Top bar */}
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
            Habitly
          </span>
        </div>
        <button
          className="material-symbols-outlined hover:opacity-70 transition-opacity"
          style={{ color: "var(--on-surface-variant)", fontSize: 24 }}
        >
          settings
        </button>
      </header>

      <main className="flex flex-col gap-10 px-6 pt-6 pb-32">
        <EditionHero edition={edition} />

        {progress.status === "completed" ? (
          // Completed state — no progress bar, no CTA
          <EditionCompleted
            score={progress.score}
            completedAt={progress.completedAt}
            totalStages={edition.stages.length}
            correctAnswers={progress.correctAnswers}
          />
        ) : (
          // Not started or in progress
          <>
            <EditionProgress
              edition={edition}
              completedStages={progress.currentStage}
            />
            <EditionFocus />
            <EditionCta
              edition={edition}
              status={progress.status}
              currentStage={progress.currentStage}
            />
          </>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}