import { themeIndexFor } from "@/lib/matchbox/game-order";
import type { RecentGame } from "@/features/recent-games/types";

function Flame({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 28" width="15" height="17" aria-hidden="true" opacity={lit ? 1 : 0.6}>
      <path
        d="M12 1c1 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 1 4 3 4-1-5 0-9 2-13z"
        strokeWidth="2.2"
        style={{ fill: lit ? "var(--mb-lyel)" : "none", stroke: lit ? "var(--mb-ink)" : "currentColor" }}
      />
    </svg>
  );
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Presentational: renders the "Recently struck" slider from props.
 * Cards are not interactive yet (games aren't replayable). When replay ships,
 * swap the <div> for a <Link> and drop the `static` class.
 */
export default function RecentGames({ games }: { games: RecentGame[] }) {
  return (
    <>
      <div className="sech">
        Recently struck {games.length > 0 ? <em>swipe →</em> : null}
      </div>

      {games.length === 0 ? (
        <div className="card paper">
          <div className="note" style={{ marginTop: 0 }}>Nothing struck yet. Play today&apos;s box to start your shelf.</div>
        </div>
      ) : (
        <div className="slider" role="list">
          {games.map((g) => {
            const i = themeIndexFor(g.gameType);
            const max = g.maxScore ?? 3;
            const nr = `Nº ${String(g.editionNo).padStart(3, "0")}`;
            return (
              <div
                key={g.id}
                role="listitem"
                className="hbox static"
                aria-label={`${nr}, ${g.gameLabel}, ${g.topic}, ${formatDate(g.playedAt)}, ${g.score} of ${max} correct`}
                style={{ ["--c" as string]: `var(--mb-t${i})`, ["--f" as string]: `var(--mb-tf${i})` }}
              >
                <span className="hs" />
                <span className="ht">
                  <span className="hn">{nr}</span>
                  <span className="hf">
                    {Array.from({ length: max }, (_, k) => (
                      <Flame key={k} lit={k < g.score} />
                    ))}
                  </span>
                </span>
                <b>{g.gameLabel}</b>
                <small>{g.topic} · {formatDate(g.playedAt)}</small>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
