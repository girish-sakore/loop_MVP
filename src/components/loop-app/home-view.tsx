import Link from "next/link";

import type { Edition } from "@/types/gameplay";
import type { StreakData, StreakDayState } from "@/features/streak/types";
import type { RecentGame } from "@/features/recent-games/types";

type Props = {
  edition: Edition | null;
  href?: string;
  streak: StreakData;
  complete: boolean;
  gamesDone: number;
  gamesTotal: number;
  recentGames: RecentGame[];
};

const dayName = (date: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

const dayNumber = (date: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

const faceClass: Record<StreakDayState, string> = {
  struck: "is-done",
  today: "is-today",
  missed: "is-missed",
  upcoming: "is-future",
};

function Face({ state }: { state: StreakDayState }) {
  return (
    <span className={`loop-face ${faceClass[state]}`} aria-hidden="true">
      <i /><i />
    </span>
  );
}

function ChallengeCard({ edition, href, complete, gamesDone, gamesTotal }: Pick<Props, "edition" | "href" | "complete" | "gamesDone" | "gamesTotal">) {
  if (!edition) {
    return <div className="loop-empty">No challenge is scheduled today. Check back soon.</div>;
  }

  const content = (
    <>
      <span className="loop-challenge-glow" aria-hidden="true" />
      <span className="loop-challenge-copy">
        <span className="loop-challenge-eyebrow">Today&apos;s edition</span>
        <strong>{edition.title}</strong>
        <span>{edition.description || "A fresh set of questions is ready for you."}</span>
      </span>
      <svg className="loop-challenge-art" viewBox="0 0 200 130" aria-hidden="true">
        <path d="M20 70c10-40 60-60 100-40 30 15 50 5 60 30 8 25-20 55-70 50-40-4-50 10-80-5-15-8-18-25-10-35z" fill="#0f1b3d" opacity=".9" />
        <circle cx="105" cy="68" r="26" fill="#fff" />
        <path d="M92 68h26M105 55v26" stroke="#1f6feb" strokeWidth="5" strokeLinecap="round" />
        <path d="M170 20l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z" fill="#f2622c" />
      </svg>
      <span className="loop-challenge-footer">
        <span className="loop-challenge-badge">
          {complete ? "✓ Completed" : `${edition.category ?? "Featured"} · ${gamesDone}/${gamesTotal || 0} games`}
        </span>
        {!complete && <span className="loop-challenge-cta">Play now <b aria-hidden="true">→</b></span>}
      </span>
    </>
  );

  return href && !complete ? (
    <Link href={href} className="loop-challenge loop-blue" aria-label={`Play ${edition.title}`}>
      {content}
    </Link>
  ) : (
    <div className="loop-challenge loop-blue is-complete">{content}</div>
  );
}

function RecentStrip({ games }: { games: RecentGame[] }) {
  if (games.length === 0) return null;

  return (
    <section className="loop-recent" aria-label="Recently played">
      <div className="loop-section-title">Recently played</div>
      <div className="loop-recent-row">
        {games.slice(0, 5).map((game, index) => (
          <Link key={game.id} href={`/edition/${game.editionId}/${game.nodeId}?mode=replay`} className={`loop-mini loop-mini-${index % 3}`}>
            <strong>{game.gameLabel}</strong>
            <span>{game.topic}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomeView({ edition, href, streak, complete, gamesDone, gamesTotal, recentGames }: Props) {
  const streakNote = streak.struckToday
    ? `${streak.current} days in a row. Come back tomorrow to continue.`
    : `${streak.current} day${streak.current === 1 ? "" : "s"} in a row. Play today to make it ${streak.current + 1}.`;

  return (
    <>
      <header className="loop-topbar">
        <div><h1>Good morning</h1><p>Ready to check in?</p></div>
        <div className="loop-top-chips"><span className="loop-gift" aria-label="Gifts">🎁</span><span className="loop-streak-chip">🔥 {streak.current}</span></div>
      </header>

      <ChallengeCard edition={edition} href={href} complete={complete} gamesDone={gamesDone} gamesTotal={gamesTotal} />

      <section className="loop-streak-section">
        <div className="loop-section-title">Your streak</div>
        <div className="loop-week">
          {streak.week.map((day) => (
            <div key={day.date} className={day.state === "today" ? "is-selected" : undefined}>
              <small>{dayName(day.date)}</small>
              <Face state={day.state} />
              <b>{dayNumber(day.date)}</b>
            </div>
          ))}
        </div>
        <p className="loop-note">{streakNote}</p>
      </section>

      <section className="loop-stats" aria-label="Your game statistics">
        <div><b>{streak.stats.accuracyPct}%</b><span>Answers right</span></div>
        <div><b>{streak.stats.boxesStruck}</b><span>Games done</span></div>
        <div><b>{streak.stats.gameTypes}</b><span>Game types</span></div>
      </section>

      <RecentStrip games={recentGames} />
    </>
  );
}
