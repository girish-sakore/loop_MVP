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
    <div className="flex min-h-[100dvh] flex-col bg-[#f6f2ec]">
      <header
        className="flex h-[86px] w-full flex-shrink-0 items-center justify-between border-b-[3px] border-[#0b0b0f] bg-[#f6f2ec] px-4"
      >
        <div className="flex items-center gap-4 flex-1">
          <Link
            href="/map"
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] transition active:scale-95"
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--on-surface)" }}
            >
              close
            </span>
          </Link>
          <div
            className="relative h-5 max-w-xs flex-1 overflow-hidden rounded-full border-[3px] border-[#0b0b0f]"
            style={{ backgroundColor: "#f6f2ec" }}
          >
            <div
              className="absolute top-0 left-0 h-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: "#d8d0c3",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-4">
          {Array.from({ length: totalAttempts }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: 22,
                color:
                  i < attemptsRemaining
                    ? "#f05d5e"
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

      <span className="sr-only">{stageLabel}</span>

      <main className="flex-1 px-0 pb-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
