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
import { getAllEditions, lastDays } from "@/features/editions/edition-content";
import { getAllGameProgress } from "@/features/gameplay/progress/daily-game-progress";

const PROFILE_HISTORY_DAYS = 10;

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

  const [streak, recentGames, editions, progress] = await Promise.all([
    getStreak(session.user.id),
    getRecentGames(session.user.id),
    getAllEditions(),
    getAllGameProgress(session.user.id),
  ]);
  const progressByGame = new Map(progress.map((p) => [p.game.id, p.progress]));

  const identity: ProfileIdentity = {
    name: user.name ?? "",
    email: user.email,
    image: user.image ?? null,
    isPremium: user.isPremium ?? false,
    plan: user.plan ?? null,
    subscriptionEnd: user.subscriptionEnd ?? null,
  };

  const villageProgress: ProfileVillage[] = lastDays(editions, PROFILE_HISTORY_DAYS)
    .map((edition) => {
      const p = progressByGame.get(edition.game.id);
      const total = edition.edition.nodes[0]?.subStages.length ?? 0;
      const completed = p?.status === "completed" ? total : Math.min(p?.currentSubStage ?? 0, total);
      return {
        id: edition.dateKey,
        title: edition.edition.title,
        order: edition.edition.order,
        completed,
        total,
        locked: false,
      };
    })
    .reverse();

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