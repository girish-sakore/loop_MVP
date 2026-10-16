import { prisma } from "@/lib/db";
import { getEditionSummaries } from "@/features/editions/edition-content";
import { hasPremium } from "@/lib/premium";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import ProfileView, {
  type ProfileIdentity,
  type ProfileVillage,
} from "@/components/profile/profile-view";
import { getStreak } from "@/features/streak/get-streak";
import { getRecentGames } from "@/features/recent-games/get-recent-games";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const user = session.user as {
    name?: string | null;
    email: string;
    image?: string | null;
    isPremium?: boolean;
    plan?: string | null;
    subscriptionEnd?: string | null;
  };

  const identity: ProfileIdentity = {
    name: user.name ?? "",
    email: user.email,
    image: user.image ?? null,
    isPremium: user.isPremium ?? false,
    plan: user.plan ?? null,
    subscriptionEnd: user.subscriptionEnd ?? null,
  };

  const [streak, recentGames, summaries, doneRows] = await Promise.all([
    getStreak(session.user.id),
    getRecentGames(session.user.id),
    getEditionSummaries(),
    prisma.userNodeProgress.groupBy({
      by: ["editionId"],
      where: { userId: session.user.id, status: "completed" },
      _count: { _all: true },
    }),
  ]);

  const done = new Map(doneRows.map((r) => [r.editionId, r._count._all]));
  const premium = hasPremium(session.user);
  const villageProgress: ProfileVillage[] = summaries.slice(0, 30).map((e, i) => ({
    id: e.id,
    title: e.title,
    order: summaries.length - i,
    completed: done.get(e.id) ?? 0,
    total: e.gameCount,
    locked: !premium && i > 0, // free users only have the featured (newest) edition
  }));

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page">
        <ProfileView
          identity={identity}
          streak={streak}
          recentGames={recentGames}
          villages={villageProgress}
        />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}