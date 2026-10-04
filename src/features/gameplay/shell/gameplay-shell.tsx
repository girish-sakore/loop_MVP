import type { ReactNode } from "react";
import Link from "next/link";

type GameplayShellProps = {
  stageLabel: string;
  progress: number; // 0–100
  attemptsRemaining: number;
  totalAttempts: number;
  children: ReactNode;
};

export function GameplayShell({
  stageLabel,
  progress,
  attemptsRemaining,
  totalAttempts,
  children,
}: GameplayShellProps) {
  return (
    <div className="mb mb-root gp-shell">
      <header className="gp-head">
        <Link href="/map" className="gp-close" aria-label="Close game">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </Link>

        <div
          className="gp-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Game progress"
        >
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="gp-lives" aria-label={`${attemptsRemaining} of ${totalAttempts} lives left`}>
          {Array.from({ length: totalAttempts }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                fontSize: 24,
                color:
                  i < attemptsRemaining
                    ? "var(--mb-yel)"
                    : "color-mix(in srgb, var(--mb-onbg) 35%, transparent)",
                fontVariationSettings: i < attemptsRemaining ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              local_fire_department
            </span>
          ))}
        </div>
      </header>

      <span className="sr-only">{stageLabel}</span>

      <main className="gp-main">{children}</main>
    </div>
  );
}