import type { StreakData, StreakDayState } from "@/features/streak/types";

const DAY_LETTERS = "SMTWTFS";

const flameClass: Record<StreakDayState, string> = {
  struck: "on",
  today: "today",
  missed: "off",
  upcoming: "off",
};

function Flame({ state }: { state: StreakDayState }) {
  return (
    <svg
      className={`fl ${flameClass[state]}`}
      style={{ ["--r" as string]: "0deg" }}
      viewBox="0 0 24 28"
      aria-hidden="true"
    >
      <path className="o" d="M12 1c1 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 1 4 3 4-1-5 0-9 2-13z" />
      <path className="i" d="M12 14c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1 1 2 2 2z" />
    </svg>
  );
}

/** Purely presentational: no fetching, all copy derived from props. */
export default function StreakCard({ streak }: { streak: StreakData }) {
  const { current, best, goal, struckToday, week, stats } = streak;
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const remaining = Math.max(0, goal - current);

  const note = struckToday
    ? `${current} struck in a row. Come back tomorrow.`
    : `${current} struck in a row. Strike today's to make it ${current + 1}.`;
  const goldNote = remaining === 0 ? "The Gold Box is yours." : `${remaining} more to the Gold Box.`;

  return (
    <>
      <div className="card dark">
        <div className="top2">
          <div className="bigs">
            <span>{current}</span>
            <small>day streak</small>
          </div>
          <span className="mono lt2">BEST {best}</span>
        </div>

        <div className="week">
          {week.map((d) => {
            const letter = DAY_LETTERS[new Date(`${d.date}T00:00:00Z`).getUTCDay()];
            return (
              <div key={d.date}>
                <Flame state={d.state} />
                <div className="wl">{letter}</div>
              </div>
            );
          })}
        </div>

        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(current, goal)}
          aria-label="Progress to the Gold Box"
        >
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="note">{note}</div>
        <div className="mono lt2" style={{ marginTop: 4 }}>{goldNote}</div>
      </div>

      <div className="stats">
        <div><b>{stats.accuracyPct}%</b><span>answers right</span></div>
        <div><b>{stats.boxesStruck}</b><span>boxes struck</span></div>
        <div><b>{stats.gameTypes}</b><span>game types</span></div>
      </div>
    </>
  );
}
