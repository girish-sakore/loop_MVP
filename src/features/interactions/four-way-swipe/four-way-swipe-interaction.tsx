"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

import type { FourWaySwipeDirection, FourWaySwipeStage } from "@/types/gameplay";

const SWIPE_THRESHOLD = 92;

type Props = {
  stage: FourWaySwipeStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

const directionMeta: Record<FourWaySwipeDirection, {
  icon: string;
  className: string;
  fly: { x: number; y: number };
}> = {
  up: {
    icon: "keyboard_arrow_up",
    className: "left-1/2 top-0 h-20 w-[calc(100%-96px)] -translate-x-1/2 bg-[#f7d91f]",
    fly: { x: 0, y: -620 },
  },
  down: {
    icon: "keyboard_arrow_down",
    className: "bottom-0 left-1/2 h-20 w-[calc(100%-96px)] -translate-x-1/2 bg-[#b996f6]",
    fly: { x: 0, y: 620 },
  },
  left: {
    icon: "keyboard_arrow_left",
    className: "left-0 top-1/2 h-[calc(100%-112px)] w-20 -translate-y-1/2 bg-[#f05d5e]",
    fly: { x: -620, y: 0 },
  },
  right: {
    icon: "keyboard_arrow_right",
    className: "right-0 top-1/2 h-[calc(100%-112px)] w-20 -translate-y-1/2 bg-[#66cfd3]",
    fly: { x: 620, y: 0 },
  },
};

export function FourWaySwipeInteraction({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const answered = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-8, 8]);
  const [activeDirection, setActiveDirection] = useState<FourWaySwipeDirection | null>(null);

  useEffect(() => {
    answered.current = false;
    animate(x, 0, { type: "spring", stiffness: 320, damping: 24 });
    animate(y, 0, { type: "spring", stiffness: 320, damping: 24 });
  }, [retryCount, stage.id]);

  useMotionValueEvent(x, "change", (latestX) => {
    setActiveDirection(getDominantDirection(latestX, y.get()));
  });

  useMotionValueEvent(y, "change", (latestY) => {
    setActiveDirection(getDominantDirection(x.get(), latestY));
  });

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

  if (showIntro) {
    return (
      <div className="flex min-h-[calc(100dvh-86px)] flex-col bg-[#f6f2ec] px-5 pb-10 pt-8 text-[#0b0b0f]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_#0b0b0f]">
            Compass
          </span>
          <div className="relative my-10 grid h-56 w-56 place-items-center">
            {(["up", "right", "down", "left"] as FourWaySwipeDirection[]).map((direction) => (
              <span
                key={direction}
                className={`absolute flex items-center justify-center rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_5px_0_rgba(11,11,15,0.18)] ${direction === "up"
                  ? "top-0 h-14 w-28"
                  : direction === "down"
                    ? "bottom-0 h-14 w-28"
                    : direction === "left"
                      ? "left-0 h-28 w-14"
                      : "right-0 h-28 w-14"
                  }`}
              >
                <span className="material-symbols-outlined text-[28px]">{directionMeta[direction].icon}</span>
              </span>
            ))}
            <motion.div
              className="h-28 w-24 rounded-[8px] border-[3px] border-[#0b0b0f] bg-[#f7d91f] shadow-[0_8px_0_rgba(11,11,15,0.18)]"
              animate={{ x: [0, 22, 0, -22, 0], y: [0, -22, 0, 22, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <h1 className="font-display text-[34px] leading-none">Swipe toward the answer</h1>
          <p className="mt-3 max-w-[300px] text-[16px] font-semibold leading-snug text-[#343238]">
            Four choices surround the card. Drag in the direction that matches the clue.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onIntroComplete?.()}
          className="h-14 rounded-full bg-[#0b0b0f] text-[17px] font-extrabold text-[#fffdf7] transition active:translate-y-0.5 disabled:opacity-40"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-4 pt-4 text-[#0b0b0f]">
      <div className="mb-3 flex shrink-0 flex-col items-center gap-2 text-center">
        <span className="inline-flex rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_#0b0b0f]">
          Compass
        </span>
        <h1 className="font-display max-w-[360px] text-[27px] leading-none">
          {stage.question}
        </h1>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[18px] border-[3px] border-[#0b0b0f] bg-[#fffdf7]">
        {(["up", "down", "left", "right"] as FourWaySwipeDirection[]).map((direction) => (
          <AnswerZone
            key={direction}
            direction={direction}
            label={stage.answers[direction].label}
            armed={activeDirection === direction}
          />
        ))}

        <div className="absolute inset-0 grid place-items-center px-[92px] py-[102px]">
          <motion.div
            drag={disabled ? false : true}
            dragElastic={0.16}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (disabled) return;

              const direction = getDominantDirection(info.offset.x, info.offset.y);
              if (direction && Math.max(Math.abs(info.offset.x), Math.abs(info.offset.y)) > SWIPE_THRESHOLD) {
                finish(direction);
              } else {
                resetCard();
              }
            }}
            className="relative flex min-h-[220px] w-full min-w-[172px] cursor-grab select-none flex-col items-center justify-center rounded-[10px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-5 text-center shadow-[0_8px_0_rgba(11,11,15,0.18)] active:cursor-grabbing"
            style={{ x, y, rotate, touchAction: "none" }}
          >
            <span className="mb-4 rounded-full bg-[#efe8dc] px-3 py-1 text-[11px] font-extrabold uppercase text-[#6d6963]">
              {stage.category ?? stage.mapTitle}
            </span>
            {stage.prompt ? (
              <p className="mb-3 text-[14px] font-bold leading-snug text-[#6d6963]">{stage.prompt}</p>
            ) : null}
            <p className="text-[21px] font-extrabold leading-tight">{stage.question}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnswerZone({
  direction,
  label,
  armed,
}: {
  direction: FourWaySwipeDirection;
  label: string;
  armed: boolean;
}) {
  return (
    <div
      className={`absolute z-0 flex items-center justify-center border-[#0b0b0f] p-2 text-center text-[13px] font-extrabold leading-tight transition ${directionMeta[direction].className
        } ${armed ? "brightness-110 saturate-150" : ""}`}
    >
      <span className="flex max-w-[118px] flex-col items-center gap-1">
        <span className="material-symbols-outlined text-[24px]">{directionMeta[direction].icon}</span>
        {label}
      </span>
    </div>
  );
}

function getDominantDirection(x: number, y: number): FourWaySwipeDirection | null {
  if (Math.max(Math.abs(x), Math.abs(y)) < 20) return null;
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? "right" : "left";
  return y > 0 ? "down" : "up";
}
