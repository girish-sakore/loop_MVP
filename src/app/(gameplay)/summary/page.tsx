import Link from "next/link";

import { CompletionCard } from "@/components/feedback/completion-card";
import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { getFeaturedEdition } from "@/features/editions/edition-content";

export default function SummaryPage() {
  const edition = getFeaturedEdition();
  return (
    <MobileContainer>
      <TopBar title="Summary" subtitle="Weekly completion" />
      <main className="space-y-4 px-4 pt-8">
        <CompletionCard title={edition.title} score={180} />
        <Link
          href={`/edition/${edition.id}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-semibold"
        >
          Replay this edition
        </Link>
      </main>
    </MobileContainer>
  );
}
