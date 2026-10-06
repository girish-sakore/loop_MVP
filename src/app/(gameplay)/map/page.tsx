import Link from "next/link";
import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { EditionHero } from "@/components/edition-intro/edition-hero";
import CatButton from "@/components/matchbox/cat-button";
import StrikeLink from "@/components/matchbox/strike-link";
import { getAuthSession } from "@/lib/auth-session";
import { getTodayEdition } from "@/features/editions/edition-content";
import { getGameProgress } from "@/features/gameplay/progress/daily-game-progress";
import StreakCard from "@/components/matchbox/streak-card";
import { getStreak } from "@/features/streak/get-streak";
import RecentGames from "@/components/matchbox/recent-games";
import { getRecentGames } from "@/features/recent-games/get-recent-games";

type TileConfig = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
};

type RoundTileData = {
  index: number;
  total: number;
  state: "completed" | "current" | "locked";
  question: string;
};

// Colours now come from the active matchbox theme (--mb-t0..t10), picked by game order.
const gameTileConfig: Record<string, TileConfig> = {
  "border-hop": { key: "border-hop", title: "Border Hop", subtitle: "Cross the world", icon: "travel_explore", badge: "New" },
  swipe: { key: "swipe", title: "This or That", subtitle: "Pick a side", icon: "style" },
  "timeline-builder": { key: "timeline-builder", title: "Chrono", subtitle: "Order events", icon: "hourglass_top" },
  reorder: { key: "reorder", title: "Sort", subtitle: "Arrange order", icon: "swap_vert" },
  "four-way-swipe": { key: "four-way-swipe", title: "Compass", subtitle: "Swipe answers", icon: "open_with", badge: "New" },
  "drag-drop": { key: "drag-drop", title: "Links", subtitle: "Connect cards", icon: "conversion_path" },
  "image-select": { key: "image-select", title: "Knockout", subtitle: "Choose a winner", icon: "hotel_class" },
  "fill-blank": { key: "fill-blank", title: "Hindsight", subtitle: "Find the moment", icon: "public", badge: "New" },
  "color-match": { key: "color-match", title: "Palette", subtitle: "Match the color", icon: "palette" },
};

// const gameOrder = [
//   "swipe",
//   "timeline-builder",
//   "reorder",
//   "four-way-swipe",
//   "drag-drop",
//   "image-select",
//   "fill-blank",
//   "color-match",
//   "border-hop",
// ];

export default async function MapPage() {

  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const [streak, recentGames] = await Promise.all([
    getStreak(session.user.id),
    getRecentGames(session.user.id),
  ]);

  // Today's game comes straight from the database (one DailyGame per day).
  const today = await getTodayEdition();
  const todayProgress = today ? await getGameProgress(session.user.id, today.game) : null;
  const todayRounds = today?.edition.nodes[0]?.subStages.length ?? 0;
  const todayDone = todayProgress?.status === "completed" ? todayRounds : Math.min(todayProgress?.currentSubStage ?? 0, todayRounds);
  const allDone = today !== null && todayProgress?.status === "completed";
  const anyProgress = (todayProgress?.currentSubStage ?? 0) > 0;
  const todayHref = today ? `/edition/${today.dateKey}/${today.game.id}` : null;
  const todayTileConfig = today
    ? (gameTileConfig[today.game.type] ?? {
        key: today.game.type,
        title: today.game.title,
        subtitle: today.game.description ?? "",
        icon: "extension",
      })
    : null;
  const roundTiles: RoundTileData[] = today
    ? today.edition.nodes[0].subStages.map((stage, index) => ({
        index,
        total: todayRounds,
        state:
          index < todayDone
            ? "completed"
            : index === todayDone && !allDone
              ? "current"
              : "locked",
        question:
          "question" in stage && typeof stage.question === "string" && stage.question
            ? stage.question
            : today.edition.nodes[0].mapTitle,
      }))
    : [];

  return (
    <MobileContainer>
      <main className="mb mb-root mb-page">
        <div className="top">
          <div className="brand">
            <CatButton />
            <div className="banner sm"><h1>LOOP</h1></div>
          </div>
          <span className="streak">
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
              <path d="M7 0c1 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3C5 6 6 3 7 0z" style={{ fill: "var(--mb-yel)" }} />
            </svg>
            <span><span>{streak.current}</span></span>
          </span>
        </div>

        <div className="card paper" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <b style={{ fontSize: 15 }}>Try Premium+</b>
          <Link href="/pricing" className="chip on link" style={{ ["--c" as string]: "var(--mb-t1)", ["--f" as string]: "var(--mb-tf1)" }}>Unlock</Link>
        </div>

        {/* <ThemePicker /> */}

        <div className="sech">Today&apos;s game</div>
        {today ? (
          <>
            <EditionHero
              edition={today.edition}
              gamesDone={todayDone}
              gamesTotal={todayRounds}
              done={allDone}
            />
            {allDone ? (
              <div className="go static" style={{ marginTop: 14 }}>✓ STRUCK · ALL DONE TODAY</div>
            ) : (
              <StrikeLink href={todayHref!}>
                {anyProgress ? "KEEP STRIKING" : "STRIKE TODAY'S MATCH"}
              </StrikeLink>
            )}
            {todayRounds > 0 && (
              <>
                <div className="sech">Today&apos;s rounds</div>
                <section className="mb-tiles">
                  {roundTiles.map((tile) => (
                    <RoundTile key={tile.index} tile={tile} icon={todayTileConfig?.icon ?? "extension"} />
                  ))}
                  {todayRounds % 2 === 1 ? <InviteTile /> : null}
                </section>
              </>
            )}
          </>
        ) : (
          <div className="card paper"><div className="note">No box today. Check back soon.</div></div>
        )}
        <div className="sech">Your streak</div>
        <StreakCard streak={streak} />
      <RecentGames games={recentGames} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}

function RoundTile({ tile, icon }: { tile: RoundTileData; icon: string }) {
  const isLocked = tile.state === "locked";
  const i = 3; // theme index; the round tiles share the game's accent

  const content = (
    <>
      <div className="tp">
        <span className="cnt">Round {tile.index + 1}/{tile.total}</span>
        {isLocked ? (
          <span className="st">
            <span className="material-symbols-outlined">{tile.state === "completed" ? "check" : "lock"}</span>
          </span>
        ) : null}
      </div>
      <span className="material-symbols-outlined ico" aria-hidden="true">{icon}</span>
      <div>
        <h2>{tile.state === "completed" ? "Struck" : tile.state === "current" ? "Up next" : "Locked"}</h2>
        <p>{tile.question}</p>
      </div>
    </>
  );
  const style = { ["--c" as string]: `var(--mb-t${i})`, ["--f" as string]: `var(--mb-tf${i})` };

  if (isLocked) {
    return (
      <div aria-label={`Round ${tile.index + 1} ${tile.state}`} className="mb-tile off" style={style}>
        {content}
      </div>
    );
  }

  return (
    <div aria-label={`Round ${tile.index + 1}`} className="mb-tile" style={style}>
      {content}
    </div>
  );
}

function InviteTile() {
  return (
    <button type="button" className="mb-tile invite">
      <span className="material-symbols-outlined">ios_share</span>
      <span style={{ font: "700 16px var(--font-dm), system-ui, sans-serif" }}>Invite friends</span>
    </button>
  );
}

