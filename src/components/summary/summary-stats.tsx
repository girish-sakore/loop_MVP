"use client";

import { useGameplayStore } from "@/stores/gameplay-store";

export function SummaryStats({ totalStages }: { totalStages: number }) {
  const { score, correctAnswers, totalAnswers } = useGameplayStore();

  const accuracy =
    totalAnswers > 0
      ? Math.round((correctAnswers / totalAnswers) * 100)
      : 0;

  const completion =
    totalStages > 0
      ? Math.round((correctAnswers / totalStages) * 100)
      : 100;

  // Accuracy bar segments (5 bars)
  const filledBars = Math.round((accuracy / 100) * 5);

  return (
    <section className="grid grid-cols-2 gap-3">

      {/* Completion — spans full width */}
      <div
        className="col-span-2 p-6 rounded-2xl flex flex-col gap-4"
        style={{ backgroundColor: "var(--surface-container-lowest)" }}
      >
        <div>
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Overall Completion
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-[42px] font-extrabold leading-none"
              style={{ color: "var(--secondary)" }}
            >
              {completion}%
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Goal Reached
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div
          className="h-3 w-full rounded-full overflow-hidden relative"
          style={{ backgroundColor: "var(--secondary-fixed)" }}
        >
          <div
            className="h-full rounded-full relative overflow-hidden transition-all duration-1000"
            style={{
              width: `${completion}%`,
              backgroundColor: "var(--secondary)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </div>
        </div>
        <p
          className="text-xs font-medium"
          style={{ color: "var(--on-surface-variant)", opacity: 0.7 }}
        >
          {completion < 100
            ? `You're only ${100 - completion}% away from a perfect score!`
            : "Perfect score! Outstanding work."}
        </p>
      </div>

      {/* Score */}
      <div
        className="p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2"
        style={{ backgroundColor: "var(--tertiary-container)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "var(--tertiary-fixed)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 28,
              color: "var(--tertiary)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            star
          </span>
        </div>
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--on-tertiary-container)" }}
        >
          Score
        </span>
        <span
          className="text-[28px] font-extrabold leading-none"
          style={{ color: "var(--tertiary)" }}
        >
          {score}
        </span>
      </div>

      {/* Accuracy */}
      <div
        className="p-6 rounded-2xl flex flex-col gap-3"
        style={{ backgroundColor: "var(--surface-container)" }}
      >
        <div className="flex justify-between items-start">
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Accuracy
          </span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "var(--primary)" }}
          >
            target
          </span>
        </div>
        <span
          className="text-[28px] font-extrabold leading-none"
          style={{ color: "var(--on-surface)" }}
        >
          {accuracy}%
        </span>
        {/* Segment bar */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor:
                  i < filledBars
                    ? "var(--secondary)"
                    : "var(--outline-variant)",
              }}
            />
          ))}
        </div>
        <p
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: "var(--on-surface-variant)" }}
        >
          {accuracy >= 90
            ? "Precision Master"
            : accuracy >= 70
            ? "Sharp Thinker"
            : "Keep Practicing"}
        </p>
      </div>

      {/* Stages completed — full width */}
      <div
        className="col-span-2 p-6 rounded-2xl flex items-center gap-5 border"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--secondary-container) 30%, transparent)",
          borderColor:
            "color-mix(in srgb, var(--secondary-container) 50%, transparent)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4"
          style={{
            borderColor:
              "color-mix(in srgb, var(--secondary) 20%, transparent)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 32, color: "var(--secondary)" }}
          >
            workspace_premium
          </span>
        </div>
        <div>
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--on-secondary-container)" }}
          >
            Stages Cleared
          </span>
          <p
            className="text-[28px] font-extrabold leading-tight"
            style={{ color: "var(--on-secondary-container)" }}
          >
            {correctAnswers}{" "}
            <span className="text-[16px] font-medium opacity-60">
              / {totalStages}
            </span>
          </p>
          <p
            className="text-xs opacity-70"
            style={{ color: "var(--on-secondary-container)" }}
          >
            {correctAnswers === totalStages
              ? "Flawless run!"
              : "Great effort this session."}
          </p>
        </div>
      </div>

    </section>
  );
}