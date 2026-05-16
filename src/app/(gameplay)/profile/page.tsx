import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileEditions } from "@/components/profile/profile-editions";
import { LogoutButton } from "@/components/profile/logout-button";

export default async function ProfilePage() {
  const session = await getAuthSession();
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
        </section>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}