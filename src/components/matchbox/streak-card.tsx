import type { StreakData } from "@/features/streak/types";

const DAY_LETTERS = "SMTWTFS";

/** Purely presentational: no fetching, all copy derived from props. */
export default function StreakCard({ streak }: { streak: StreakData }) {
  const { current, goal, week } = streak;
  const remaining = Math.max(0, goal - current);

  return (
    <section className="sk" aria-label="Streak">
      <div className="sk-row">
        <p className="sk-title">
          <strong>{current}</strong> day streak
        </p>
        <span className="sk-aside">
          {remaining === 0 ? "Gold Box unlocked" : `${remaining} to Gold Box`}
        </span>
      </div>

      <ol className="sk-week" aria-label="This week">
        {week.map((d) => {
          const letter = DAY_LETTERS[new Date(`${d.date}T00:00:00Z`).getUTCDay()];
          return (
            <li key={d.date} className={`sk-day ${d.state}`}>
              <i className="sk-dot" />
              <span>{letter}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}