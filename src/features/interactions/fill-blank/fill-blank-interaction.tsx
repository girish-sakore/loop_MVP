"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";

import type { FillBlankStage } from "@/types/gameplay";
import { WordChip } from "./word-chip";
import { parsePrompt } from "./parse-prompt";
import { BlankDropZone } from "./blank-drop-zone";
import { WordBank } from "./word-bank";

type Props = {
  stage: FillBlankStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

type Option = FillBlankStage["options"][number];
type PlacementState = {
  key: string;
  placements: Record<string, Option | null>;
};

export function FillBlankInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
}: Props) {
  const resetKey = `${retryCount}:${stage.id}:${stage.blanks
    .map((blank) => blank.id)
    .join("|")}`;
  const [placementState, setPlacementState] = useState<PlacementState>(() =>
    createPlacementState(resetKey, stage),
  );
  const [activeOption, setActiveOption] =
    useState<Option | null>(null);
  const placements =
    placementState.key === resetKey
      ? placementState.placements
      : createPlacementState(resetKey, stage).placements;
  // console.log('stage.prompt:', stage.prompt);
  // console.log('parsed parts:', parsePrompt(stage.prompt));
  const parts = useMemo(
    () => parsePrompt(stage.prompt),
    [stage.prompt]
  );
  function handleDragStart(event: DragStartEvent) {
    if (disabled) return;

    const option = stage.options.find(
      (item) => item.id === event.active.id
    );

    if (option) {
      setActiveOption(option);
    }
  }
  function handleDragEnd(event: DragEndEvent) {
    setActiveOption(null);
    if (disabled) return;

    const { active, over } = event;

    if (!over) return;

    const blankId = over.id as string;

    const option = stage.options.find(
      (item) => item.id === active.id
    );

    if (!option) return;

    setPlacementState((currentState) => {
      const current =
        currentState.key === resetKey
          ? currentState.placements
          : createPlacementState(resetKey, stage).placements;
      const next = { ...current };

      // Remove from old blank
      for (const key of Object.keys(next)) {
        if (next[key]?.id === option.id) {
          next[key] = null;
        }
      }

      // Place into new blank
      next[blankId] = option;

      // Check if every blank has been filled
      const complete = Object.values(next).every(Boolean);

      if (!complete) {
        return { key: resetKey, placements: next };
      }

      const correct = stage.blanks.every((blank) => {
        return next[blank.id]?.word === blank.answer;
      });

      setTimeout(() => {
        onAnswer({
          correct,
          feedback: correct
            ? "Correct!"
            : "Not quite. Try again!",
        });
      }, 200);

      return { key: resetKey, placements: next };
    });
  }
  return (
    <div className="flex flex-col gap-8 pt-2">
      {/* Header */}
      <div className="text-center">
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--secondary)" }}
        >
          Fill in the Blank
        </span>

        <h1
          className="mt-2 text-[22px] font-bold"
          style={{ color: "var(--on-surface)" }}
        >
          {stage.question}
        </h1>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >        {/* Prompt */}
        <div
          className="rounded-3xl p-6 text-lg leading-9"
          style={{
            background: "var(--surface-container-low)",
            color: "var(--on-surface)",
          }}
        >
          {parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <span key={index}>
                  {part.value}
                </span>
              );
            }

            return (
              <BlankDropZone
                key={part.id}
                id={part.id}
                option={placements[part.id] ?? undefined}
              />
            );
          })}
        </div>

        {/* Word Bank */}
        <WordBank
          options={stage.options}
          placedWords={placements}
        />
        <DragOverlay>
          {activeOption ? (
            <WordChip
              id={activeOption.id}
              word={activeOption.word}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function createPlacementState(
  key: string,
  stage: FillBlankStage,
): PlacementState {
  return {
    key,
    placements: Object.fromEntries(
      stage.blanks.map((blank) => [blank.id, null]),
    ),
  };
}
