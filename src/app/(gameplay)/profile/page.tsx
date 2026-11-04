import { prisma } from "@/lib/db";
import { getEditionSummaries } from "@/features/editions/edition-content";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { MobileContainer } from "@/components/layout/mobile-container";
import BottomNav from "@/components/layout/bottom-nav";
import ProfileView, {
  type ProfileIdentity,
} from "@/components/profile/profile-view";
import { getStreak } from "@/features/streak/get-streak";

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

  const [streak, summaries, doneRows] = await Promise.all([
    getStreak(session.user.id),
    getEditionSummaries(),
    prisma.userNodeProgress.groupBy({
      by: ["editionId"],
      where: { userId: session.user.id, status: "completed" },
      _count: { _all: true },
    }),
  ]);

  const done = new Map(doneRows.map((r) => [r.editionId, r._count._all]));
  const editionsCompleted = summaries.filter((edition) => {
    return edition.gameCount > 0 && done.get(edition.id) === edition.gameCount;
  }).length;

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page profile-page">
        <ProfileView
          identity={identity}
          streak={streak}
          editionsCompleted={editionsCompleted}
        />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
