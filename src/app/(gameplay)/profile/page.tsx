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
import { buildVillageMapData } from "@/features/map/map-content";

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

  const [streak, recentGames, villages] = await Promise.all([
    getStreak(session.user.id),
    getRecentGames(session.user.id),
    buildVillageMapData(session.user.id),
  ]);

  const identity: ProfileIdentity = {
    name: user.name ?? "",
    email: user.email,
    image: user.image ?? null,
    isPremium: user.isPremium ?? false,
    plan: user.plan ?? null,
    subscriptionEnd: user.subscriptionEnd ?? null,
  };

  const villageProgress: ProfileVillage[] = villages.map((village) => ({
    id: village.editionId,
    title: village.title,
    order: village.order,
    completed: village.nodes.filter((n) => n.status === "completed").length,
    total: village.nodes.length,
    locked: village.status === "locked",
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