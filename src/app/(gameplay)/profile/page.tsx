import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { PremiumCard } from "@/components/ui/premium-card";
import { getCachedAuthSession } from "@/lib/auth-session";

export default async function ProfilePage() {
  // const session = await requireUserSession("/profile");
  const session = await getCachedAuthSession();

  return (
    <MobileContainer>
      <TopBar title="Profile" subtitle="Your weekly streak" />
      <main className="space-y-4 px-4 py-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          {/* <p className="text-lg font-semibold">{session}</p> */}
          {/* <p className="text-lg font-semibold">{session.user.name || session.user.email}</p> */}
          <p className="text-sm text-muted-foreground">14 day streak</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Editions
              </p>
              <p className="text-lg font-semibold">12</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Accuracy
              </p>
              <p className="text-lg font-semibold">92%</p>
            </div>
          </div>
        </section>
        <PremiumCard />
      </main>
    </MobileContainer>
  );
}
