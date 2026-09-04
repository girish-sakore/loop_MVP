import type { ReactNode } from "react";
import Link from "next/link";

type GameplayShellProps = {
  stageLabel: string;
  progress: number;          // 0–100
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
    <div
      className="flex min-h-[100dvh] flex-col"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between w-full px-6 h-16 flex-shrink-0"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {/* Left: close + progress bar */}
        <div className="flex items-center gap-4 flex-1">
          <Link href="/map">
            <span
              className="material-symbols-outlined hover:opacity-70 transition-opacity"
              style={{ color: "var(--on-surface-variant)" }}
            >
              close
            </span>
          </Link>
          {/* Progress bar */}
          <div
            className="flex-1 max-w-xs h-3 rounded-full overflow-hidden relative"
            style={{ backgroundColor: "var(--surface-container)" }}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--secondary)",
              }}
            >
              {/* Shine */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: hearts */}
        <div className="flex items-center gap-1.5 ml-4">
          {Array.from({ length: totalAttempts }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color:
                  i < attemptsRemaining
                    ? "#e8614a"
                    : "var(--surface-variant)",
                fontVariationSettings:
                  i < attemptsRemaining ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              favorite
            </span>
          ))}
        </div>
      </header>

      {/* Stage label */}
      <div className="px-6 pb-2">
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--secondary)" }}
        >
          {stageLabel}
        </span>
      </div>

      {/* Content area */}
      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}