// color-match-header.tsx
"use client";

import type { ColorMatchStage } from "@/types/gameplay";

type Props = {
  stage: ColorMatchStage;
  matchedIds: string[];
  matchedCount: number;
  total: number;
};

export function ColorMatchHeader({ stage, matchedCount, total }: Props) {
  return (
    <header className="px-4 pt-6 pb-4 text-center">
      <div className="text-sm font-semibold text-[#746a5c]">
        {stage.eyebrow ?? "Today's Puzzle"}
      </div>
      <h1 className="mt-1 font-serif text-[34px] font-bold leading-none tracking-tight text-[#0b0b0f]">
        {stage.title ?? "Colors"}
      </h1>
      <div className="mt-2 text-sm font-semibold text-[#746a5c]">
        {matchedCount} of {total} matched
      </div>
    </header>
  );
}
