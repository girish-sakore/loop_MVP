import type { ReactNode } from "react";

import { ProgressBar } from "@/components/feedback/progress-bar";
import { TopBar } from "@/components/layout/top-bar";

type GameplayShellProps = {
  title: string;
  stageLabel: string;
  progress: number;
  attemptsRemaining: number;
  children: ReactNode;
};

export function GameplayShell({
  title,
  stageLabel,
  progress,
  attemptsRemaining,
  children,
}: GameplayShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <TopBar
        title={title}
        subtitle={stageLabel}
        trailing={
          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-danger">
            {attemptsRemaining} tries
          </span>
        }
      />
      <div className="px-4 py-3">
        <ProgressBar value={progress} />
      </div>
      <main className="flex-1 px-4 pb-8">{children}</main>
    </div>
  );
}
