"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

import type { FourWaySwipeDirection, FourWaySwipeStage, StageHints } from "@/types/gameplay";
import { STAGE_GROUP } from "@/features/gameplay/hints/registry";
import { HintButton } from "@/components/hints/hint-button";
import { HintSheet } from "@/components/hints/hint-sheet";

const SWIPE_THRESHOLD = 92;

/* Same tokens as the other games (Identify X etc.) */
const INK = "#2B2A25";
const CREAM = "#fffdf7";
const PAGE = "#FDF9F1";
const ORANGE = "#FBAE4B";
const CYAN = "#53BCD1";
const MUTED = "#6d6963";

/**
 * Optional media on the centre card. If your stage type already has
 * image / clue fields, rename these to match (or drop this type).
 */
type StageWithMedia = FourWaySwipeStage & {
  image?: string;
  imageAlt?: string;
  clue?: string;
};

type Props = {
  stage: FourWaySwipeStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
  /** Optional: shows "N tries left" above the card */
  triesLeft?: number;
  /** Hint controller from the stage runner (same prop the Swipe game receives) */
  hints?: StageHints;
};

const directionMeta: Record<
  FourWaySwipeDirection,
  {
    icon: string;
    position: string;
    layout: string;
    fly: { x: number; y: number };
  }
> = {
  up: {
    icon: "keyboard_arrow_up",
    position: "left-1/2 top-1 h-[54px] w-[calc(100%-168px)] -translate-x-1/2",
    layout: "flex-row gap-2 rounded-full",
    fly: { x: 0, y: -620 },
  },
  down: {
    icon: "keyboard_arrow_down",
    position: "bottom-2 left-1/2 h-[54px] w-[calc(100%-168px)] -translate-x-1/2",
    layout: "flex-row gap-2 rounded-full",
    fly: { x: 0, y: 620 },
  },
  left: {
    icon: "keyboard_arrow_left",
    position: "left-0 top-1/2 h-[184px] w-[64px] -translate-y-1/2",
    layout: "flex-col gap-2 rounded-[32px] py-2.5",
    fly: { x: -620, y: 0 },
  },
  right: {
    icon: "keyboard_arrow_right",
    position: "right-0 top-1/2 h-[184px] w-[64px] -translate-y-1/2",
    layout: "flex-col gap-2 rounded-[32px] py-2.5",
    fly: { x: 620, y: 0 },
  },
};

const DIRECTIONS: FourWaySwipeDirection[] = ["up", "right", "down", "left"];

export function FourWaySwipeInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
  triesLeft,
  hints,
}: Props) {
  const media = stage as StageWithMedia;
  const answered = useRef(false);
  const [sheet, setSheet] = useState(false);
  const group = hints?.group(STAGE_GROUP);

  // Count-only hints (no hint text authored): rule out one wrong answer per hint used.
  const wrongLabels = DIRECTIONS.filter((d) => d !== stage.correctDirection).map(
    (d) => stage.answers[d].label,
  );
  const eliminated = wrongLabels[Math.max((group?.usedCount ?? 1) - 1, 0) % wrongLabels.length];
  const fallbackText = `Hint: the answer is not "${eliminated}".`;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-6, 6]);
  const [activeDirection, setActiveDirection] =
    useState<FourWaySwipeDirection | null>(null);

  useEffect(() => {
    answered.current = false;
    setSheet(false);
    animate(x, 0, { type: "spring", stiffness: 320, damping: 24 });
    animate(y, 0, { type: "spring", stiffness: 320, damping: 24 });
  }, [retryCount, stage.id, x, y]);

  useMotionValueEvent(x, "change", (latestX) => {
    setActiveDirection(getDominantDirection(latestX, y.get()));
  });

  useMotionValueEvent(y, "change", (latestY) => {
    setActiveDirection(getDominantDirection(x.get(), latestY));
  });

  function openHint() {
    if (disabled || answered.current || !group?.exists) return;
    if (group.usedCount === 0 && !group.reveal()) return;
    setSheet(true);
  }

  function resetCard() {
    setActiveDirection(null);
    animate(x, 0, { type: "spring", stiffness: 320, damping: 24 });
    animate(y, 0, { type: "spring", stiffness: 320, damping: 24 });
  }

  function finish(direction: FourWaySwipeDirection) {
    if (disabled || answered.current) return;

    answered.current = true;
    setActiveDirection(null);
    const fly = directionMeta[direction].fly;
    animate(x, fly.x, { duration: 0.24, ease: "easeIn" });
    animate(y, fly.y, { duration: 0.24, ease: "easeIn" });

    const correct = direction === stage.correctDirection;
    setTimeout(() => {
      onAnswer({
        correct,
        feedback: correct ? stage.feedback.correct : stage.feedback.incorrect,
      });
    }, 190);
  }

  /* ───────────── Intro ───────────── */
  if (showIntro) {
    return (
      <div
        className="flex min-h-[calc(100dvh-86px)] flex-col px-5 pb-10 pt-8"
        style={{ background: PAGE, color: INK }}
      >
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <TopicPill>Compass</TopicPill>

          <div className="relative my-10 grid h-60 w-60 place-items-center">
            {DIRECTIONS.map((direction) => {
              const place =
                direction === "up"
                  ? "left-1/2 top-0 -translate-x-1/2"
                  : direction === "down"
                    ? "bottom-0 left-1/2 -translate-x-1/2"
                    : direction === "left"
                      ? "left-0 top-1/2 -translate-y-1/2"
                      : "right-0 top-1/2 -translate-y-1/2";
              return (
                <span
                  key={direction}
                  className={`absolute grid h-12 w-12 place-items-center rounded-full border-[3px] ${place}`}
                  style={{
                    borderColor: INK,
                    background: ORANGE,
                    boxShadow: `0 4px 0 ${INK}`,
                  }}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {directionMeta[direction].icon}
                  </span>
                </span>
              );
            })}

            <div className="relative h-32 w-24">
              <div
                className="absolute inset-0 rounded-[18px] border-[3px]"
                style={{
                  borderColor: INK,
                  background: CREAM,
                  transform: "translateY(10px) scale(0.94)",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-[18px] border-[3px]"
                style={{ borderColor: INK, background: CREAM }}
                animate={{ x: [0, 28, 0, -28, 0], y: [0, -28, 0, 28, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          <h1 className="font-display text-[32px] leading-none">
            Swipe toward the answer
          </h1>
          <p
            className="mt-3 max-w-[300px] text-[16px] font-semibold leading-snug"
            style={{ color: MUTED }}
          >
            Four choices surround the card. Drag it toward the one that fits.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onIntroComplete?.()}
          className="h-14 rounded-full border-[3px] text-[17px] font-extrabold transition active:translate-y-[3px] disabled:opacity-40"
          style={{
            background: ORANGE,
            borderColor: INK,
            boxShadow: `0 4px 0 ${INK}`,
          }}
        >
          Start
        </button>
      </div>
    );
  }

  /* ───────────── Play ───────────── */
  const clueText = media.clue;

  return (
    <div
      className="flex h-[calc(100dvh-86px)] flex-col overflow-hidden px-4 pb-4 pt-4"
      style={{ background: PAGE, color: INK }}
    >
      <div className="flex shrink-0 flex-col items-center gap-2 text-center">
        <TopicPill>{stage.category ?? "Compass"}</TopicPill>
        <h1 className="font-display max-w-[360px] text-[28px] leading-none">
          {stage.question}
        </h1>
        {stage.prompt ? (
          <p
            className="max-w-[300px] text-[13px] font-semibold leading-snug"
            style={{ color: MUTED }}
          >
            {stage.prompt}
          </p>
        ) : null}
      </div>

      {typeof triesLeft === "number" ? (
        <p
          className="mt-3 shrink-0 text-right text-[12px] font-extrabold"
          style={{ color: MUTED }}
        >
          {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
        </p>
      ) : (
        <div className="h-3 shrink-0" />
      )}

      {/* Board */}
      <div className="relative min-h-0 flex-1">
        {DIRECTIONS.map((direction) => (
          <AnswerPill
            key={direction}
            direction={direction}
            label={stage.answers[direction].label}
            armed={activeDirection === direction}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center px-[78px] pb-[84px] pt-[70px]">
          <div
            className="relative"
            style={{ height: "min(100%, 250px)", aspectRatio: "4 / 5", maxWidth: "100%" }}
          >
            {/* stacked cards peeking out underneath */}
            <div
              className="absolute inset-0 rounded-[22px] border-[3px]"
              style={{
                borderColor: INK,
                background: CREAM,
                transform: "translateY(16px) scale(0.92)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[22px] border-[3px]"
              style={{
                borderColor: INK,
                background: CREAM,
                transform: "translateY(8px) scale(0.96)",
              }}
            />

            <motion.div
              drag={disabled ? false : true}
              dragElastic={0.16}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (disabled) return;

                const direction = getDominantDirection(info.offset.x, info.offset.y);
                if (
                  direction &&
                  Math.max(Math.abs(info.offset.x), Math.abs(info.offset.y)) >
                    SWIPE_THRESHOLD
                ) {
                  finish(direction);
                } else {
                  resetCard();
                }
              }}
              className="absolute inset-0 flex cursor-grab select-none flex-col overflow-hidden rounded-[22px] border-[3px] active:cursor-grabbing"
              style={{
                x,
                y,
                rotate,
                touchAction: "none",
                borderColor: INK,
                background: CREAM,
              }}
            >
              {media.image ? (
                <div
                  className={`relative min-h-0 flex-1 ${clueText ? "border-b-[3px]" : ""}`}
                  style={{ borderColor: INK, background: PAGE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.image}
                    alt={media.imageAlt ?? ""}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              {clueText || !media.image ? (
              <div
                className={`flex items-center justify-center px-4 py-4 text-center ${
                  media.image ? "shrink-0" : "flex-1"
                }`}
              >
                {clueText ? (
                  <p
                    className={`font-display font-bold leading-snug ${
                      media.image ? "text-[14px]" : "text-[17px]"
                    }`}
                  >
                    {clueText}
                  </p>
                ) : (
                  <span className="material-symbols-outlined text-[48px]">explore</span>
                )}
              </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </div>

      {group?.exists ? (
        <div className="mx-auto mt-3 flex w-full  shrink-0 justify-center border-t-[3px] border-[#2B2A25] pt-4 pb-1 four-way-hint">
          <HintButton group={group} onOpen={openHint} disabled={disabled} />
        </div>
      ) : null}
      <HintSheet
        open={sheet}
        group={group}
        fallbackText={fallbackText}
        onClose={() => setSheet(false)}
      />
    </div>
  );
}

function TopicPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex rounded-full border-[3px] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest"
      style={{ background: CYAN, borderColor: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      {children}
    </span>
  );
}

function AnswerPill({
  direction,
  label,
  armed,
}: {
  direction: FourWaySwipeDirection;
  label: string;
  armed: boolean;
}) {
  const meta = directionMeta[direction];

  return (
    <div
      className={`absolute z-0 flex items-center justify-center border-[3px] px-2 text-center font-display text-[16px] font-bold leading-tight transition-all duration-150 ${meta.position} ${meta.layout} ${armed ? "scale-[1.07]" : ""}`}
      style={{
        borderColor: INK,
        background: armed ? ORANGE : CREAM,
        boxShadow: armed ? `0 6px 0 ${INK}` : `0 4px 0 ${INK}`,
      }}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[3px] transition-colors"
        style={{
          borderColor: INK,
          background: armed ? CREAM : ORANGE,
        }}
      >
        <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
      </span>
      {direction === "left" || direction === "right" ? (
        // left reads bottom→top, right reads top→bottom
        <span
          className={`min-h-0 flex-1 text-center [writing-mode:vertical-rl] ${
            direction === "left" ? "rotate-180" : ""
          }`}
        >
          {label}
        </span>
      ) : (
        <span className="max-w-full break-words">{label}</span>
      )}
    </div>
  );
}

function getDominantDirection(x: number, y: number): FourWaySwipeDirection | null {
  if (Math.max(Math.abs(x), Math.abs(y)) < 20) return null;
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "right" : "left";
  return y > 0 ? "down" : "up";
}