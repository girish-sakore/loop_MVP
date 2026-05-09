import Link from "next/link";

import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { getFeaturedEdition } from "@/features/editions/edition-content";

export default function LandingPage() {
  const edition = getFeaturedEdition();

  return (
    <MobileContainer>
      <TopBar title="Habitly" subtitle="Weekly Interactive Learning" />
      <main className="space-y-6 px-4 pb-10 pt-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            This week
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{edition.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{edition.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {edition.stages.length} stages • {edition.estimatedTime}
          </p>
          <Link
            href={`/edition/${edition.id}`}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Start this edition
          </Link>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Continuous flow gameplay. One route, dynamic challenges, and smooth
            progression.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/login" className="text-sm font-semibold text-primary">
              Login
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/pricing" className="text-sm font-semibold text-primary">
              Pricing
            </Link>
          </div>
        </section>
      </main>
    </MobileContainer>
  );
}
