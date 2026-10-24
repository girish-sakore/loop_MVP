import type { StreakDayState } from "@/features/streak/types";

type MascotState = StreakDayState | "hero";

const labels: Record<MascotState, string> = {
  struck: "completed streak day",
  today: "today's streak",
  missed: "missed streak day",
  upcoming: "upcoming streak day",
  hero: "Loop mascot",
};

/** The little two-eyed character that makes the streak feel alive. */
export default function StreakMascot({ state = "hero" }: { state?: MascotState }) {
  return (
    <svg
      className={`streak-mascot ${state}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={labels[state]}
    >
      <rect className="streak-mascot-body" x="4" y="8" width="56" height="52" rx="19" />
      <path className="streak-mascot-shine" d="M15 18c5-5 12-7 20-6" />
      <g className="streak-mascot-eyes">
        <circle cx="23" cy="35" r="10" />
        <circle cx="41" cy="35" r="10" />
        <circle className="streak-mascot-pupil" cx="23" cy="35" r="4" />
        <circle className="streak-mascot-pupil" cx="41" cy="35" r="4" />
      </g>
      <path className="streak-mascot-smile" d="M28 47c2.5 2 5.5 2 8 0" />
    </svg>
  );
}
