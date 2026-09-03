"use client";

import { useMemo, useState } from "react";

import type { PlaceholderStage } from "@/types/gameplay";

type Props = {
  stage: PlaceholderStage;
  onAnswer?: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

export function ReorderInteractionPlaceholder({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
}: Props) {
  return (
    <ReorderInteractionContent
      key={`${stage.id}:${retryCount}`}
      stage={stage}
      onAnswer={onAnswer}
      disabled={disabled}
    />
  );
}

function ReorderInteractionContent({
  stage,
  onAnswer,
  disabled,
}: Omit<Props, "retryCount">) {
  const initialItems = useMemo(
    () => [...(stage.items ?? [])].sort((a, b) => b.order - a.order),
    [stage.items],
  );
  const [items, setItems] = useState(initialItems);

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    setItems((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function submitAnswer() {
    const correct = items.every((item, index) => item.order === index + 1);
    onAnswer?.({
      correct,
      feedback: correct
        ? "Correct. Everything is in the right order."
        : "Not quite. Move the earliest item higher and try again.",
    });
  }

  return (
    <div className="flex min-h-[calc(100dvh-180px)] flex-col px-5 pb-6 pt-4">
      <div className="mb-5">
        <p className="text-[14px] font-extrabold uppercase text-[#6d6963]">
          {stage.mapTitle}
        </p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-none">
          {stage.question}
        </h1>
        <p className="mt-3 text-[16px] leading-snug text-[#343238]">
          {stage.prompt}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex min-h-16 items-center gap-3 rounded-[14px] border-2 border-[#0b0b0f] bg-[#fffdf7] p-3 shadow-[0_4px_0_rgba(11,11,15,0.18)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7d91f] text-[16px] font-extrabold">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-[17px] font-extrabold leading-tight">
              {item.label}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => moveItem(index, -1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe8dc] disabled:opacity-35"
                aria-label={`Move ${item.label} up`}
              >
                <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
              </button>
              <button
                type="button"
                disabled={disabled || index === items.length - 1}
                onClick={() => moveItem(index, 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe8dc] disabled:opacity-35"
                aria-label={`Move ${item.label} down`}
              >
                <span className="material-symbols-outlined text-[22px]">arrow_downward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || items.length === 0}
        onClick={submitAnswer}
        className="mt-5 h-14 rounded-full bg-[#0b0b0f] text-[17px] font-extrabold text-[#fffdf7] transition active:translate-y-0.5 disabled:opacity-40"
      >
        Check order
      </button>
    </div>
  );
}
