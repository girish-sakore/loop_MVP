import Link from "next/link";
import { redirect } from "next/navigation";

import BottomNav from "@/components/layout/bottom-nav";
import { MobileContainer } from "@/components/layout/mobile-container";
import { EditionHero } from "@/components/edition-intro/edition-hero";
import CatButton from "@/components/matchbox/cat-button";
import StrikeLink from "@/components/matchbox/strike-link";
import ThemePicker from "@/components/matchbox/theme-picker";
import { getAuthSession } from "@/lib/auth-session";
import type { EditionNode } from "@/types/gameplay";
import StreakCard from "@/components/matchbox/streak-card";
import { getStreak } from "@/features/streak/get-streak";
import RecentGames from "@/components/matchbox/recent-games";
import { getRecentGames } from "@/features/recent-games/get-recent-games";
import { GAME_ORDER as gameOrder, themeIndexFor } from "@/lib/matchbox/game-order";
import { getFeaturedEdition } from "@/features/editions/edition-content";
import { getAllUserNodeProgress, type NodeProgress } from "@/lib/edition-progress";
import { hasPremium } from "@/lib/premium";
import type { Edition } from "@/types/gameplay";

type TileNode = {
  nodeId: string;
  status: "completed" | "current" | "locked";
  completedSubGames: number;
  totalSubGames: number;
};

type TileConfig = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
};

type GameTile = TileConfig & {
  editionId: string;
  mapTitle: string;
  node: TileNode;
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

  const [streak, recentGames, currentEdition] = await Promise.all([
    getStreak(session.user.id),
    getRecentGames(session.user.id),
    getFeaturedEdition(),
  ]);
  const progress = currentEdition
    ? await getAllUserNodeProgress(session.user.id, currentEdition.id)
    : new Map<string, NodeProgress>();

  const gameTiles = currentEdition
    ? buildGameTiles(currentEdition, progress, hasPremium(session.user))
    : [];

  const playable = gameTiles.filter((t) => t.node.status !== "locked");
  const total = playable.length;
  const completed = playable.filter((t) => t.node.status === "completed").length;
  const allDone = total > 0 && completed === total;
  const anyProgress = gameTiles.some((t) => t.node.completedSubGames > 0);
  const next = gameTiles.find((t) => t.node.status === "current");

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
        {currentEdition ? (
          <>
            <EditionHero
              edition={currentEdition}
              title={currentEdition?.title}
              gamesDone={completed}
              gamesTotal={total}
              done={allDone}
            />
            {allDone || !next ? (
              <div className="go static" style={{ marginTop: 14 }}>{allDone ? "✓ STRUCK · ALL DONE TODAY" : "COMING SOON"}</div>
            ) : (
              <StrikeLink href={`/edition/${next.editionId}/${next.node.nodeId}`}>
                {anyProgress ? "KEEP STRIKING" : "STRIKE TODAY'S MATCH"}
              </StrikeLink>
            )}
          </>
        ) : (
          <div className="card paper"><div className="note">No box today. Check back soon.</div></div>
        )}
        <div className="sech">Your streak</div>
        <StreakCard streak={streak} />
        {gameTiles.length > 0 && (
          <>
            <div className="sech">Today&apos;s games</div>
            <section className="mb-tiles">
              {gameTiles.map((tile) => (
                <TodayTile key={tile.node.nodeId} tile={tile} />
              ))}
              {gameTiles.length % 2 === 1 ? <InviteTile /> : null}
            </section>
          </>
        )} */}
        <RecentGames games={recentGames} />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}

function TodayTile({ tile }: { tile: GameTile }) {
  const isCompleted = tile.node.status === "completed";
  const isLocked = isCompleted || tile.node.status === "locked";
  const i = themeIndexFor(tile.key);

  const content = (
    <>
      {tile.badge ? <span className="new">{tile.badge}</span> : null}
      <div className="tp">
        <span className="cnt">{tile.node.completedSubGames}/{tile.node.totalSubGames} games</span>
        {isLocked ? (
          <span className="st">
            <span className="material-symbols-outlined">{isCompleted ? "check" : "lock"}</span>
          </span>
        ) : null}
      </div>
      <span className="material-symbols-outlined ico" aria-hidden="true">{tile.icon}</span>
      <div>
        <h2>{tile.title}</h2>
        <p>{tile.mapTitle === tile.title ? tile.subtitle : tile.mapTitle}</p>
      </div>
    </>
  );
  const style = { ["--c" as string]: `var(--mb-t${i})`, ["--f" as string]: `var(--mb-tf${i})` };

  if (isLocked) {
    return (
      <div aria-label={`${tile.title} ${isCompleted ? "completed" : "locked"}`} className="mb-tile off" style={style}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/edition/${tile.editionId}/${tile.node.nodeId}`} aria-label={tile.title} className="mb-tile" style={style}>
      {content}
    </Link>
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

function buildGameTiles(edition: Edition, progress: Map<string, NodeProgress>, premium: boolean): GameTile[] {
  const sorted = [...edition.nodes].sort((a, b) => {
    const ai = (gameOrder as readonly string[]).indexOf(a.type);
    const bi = (gameOrder as readonly string[]).indexOf(b.type);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return sorted.map((n) => {
    const p = progress.get(n.id);
    const total = n.subStages.length;
    const done = p?.status === "completed";
    const status: TileNode["status"] = done ? "completed" : n.isPremium && !premium ? "locked" : "current";
    const config = gameTileConfig[n.type] ?? { key: n.type, title: n.mapTitle, subtitle: n.mapSubtitle, icon: "extension" };

    return {
      ...config,
      mapTitle: n.mapTitle,
      editionId: edition.id,
      node: {
        nodeId: n.id,
        status,
        totalSubGames: total,
        completedSubGames: done ? total : Math.min(p?.currentSubStage ?? 0, total),
      },
    };
  });
}
