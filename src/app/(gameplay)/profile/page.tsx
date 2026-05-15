import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { PremiumCard } from "@/components/ui/premium-card";
import { getCachedAuthSession } from "@/lib/auth-session";

export default async function ProfilePage() {
  // const session = await requireUserSession("/profile");
  const session = await getCachedAuthSession();
<<<<<<< HEAD

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
=======
  if (!session?.user) redirect("/login");

  const { name, email, image } = session.user;
  const user = session.user as {
    name?: string | null;
    email: string;
    image?: string | null;
    isPremium?: boolean;
    plan?: string | null;
    subscriptionEnd?: string | null;
  };

  const isPremium = user.isPremium ?? false;
  const plan = user.plan ?? null;
  const subscriptionEnd = user.subscriptionEnd
    ? new Date(user.subscriptionEnd)
    : null;

  return (
    <MobileContainer>
      <ProfileHeader name={name ?? ""} email={email} image={image} />

      <main className="flex flex-col gap-12 px-6 pt-8 pb-32">
        <ProfileAvatar name={name ?? ""} email={email} image={image} />
        <ProfileStats
          isPremium={isPremium}
          plan={plan}
          subscriptionEnd={subscriptionEnd}
        />
        <ProfileEditions />

        <section className="flex flex-col gap-4">
          <LogoutButton />
          <p
            className="text-center text-[11px] font-bold tracking-widest uppercase opacity-50"
            style={{ color: "var(--outline)" }}
          >
            App Version 2.4.1 (Stable)
          </p>
>>>>>>> 4023b43 (Added Razorpay - payments, checkout, subscriptions, UIUX improvements)
        </section>
        <PremiumCard />
      </main>
    </MobileContainer>
  );
}
