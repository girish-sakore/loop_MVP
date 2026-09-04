"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import type { SwipeStage } from "@/types/gameplay";

const SWIPE_THRESHOLD = 120;

type Props = {
  stage: SwipeStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
};

export function SwipeInteractionPlaceholder({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
}: Props) {
  const answered = useRef(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const leftOpacity = useTransform(x, [-140, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 140], [0, 1]);

  // Track props to trigger position reset during render synchronously
  const [resetKey, setResetKey] = useState({ stage, retryCount });

  // Reset card state when stage or retryCount changes
  // if (resetKey.stage !== stage || resetKey.retryCount !== retryCount) {
  //   setResetKey({ stage, retryCount });
  //   answered.current = false;
  //   x.set(0);
  // }
  useEffect(() => {
    answered.current = false;
    x.set(0);
  }, [stage, retryCount, x]);

  function resetCard() {
    animate(x, 0, {
      type: "spring",
      stiffness: 320,
      damping: 24,
    });
  }

  function finish(direction: "left" | "right") {
    if (answered.current) return;

    answered.current = true;

    animate(x, direction === "right" ? 600 : -600, {
      duration: 0.25,
    });

    const correct = direction === stage.correctDirection;

    setTimeout(() => {
      onAnswer({
        correct,
        feedback: correct
          ? stage.feedback.correct
          : stage.feedback.incorrect,
      });
    }, 200);
  }

  return (
    <div className="flex flex-col gap-8 pt-2">
      <div className="text-center">
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--secondary)" }}
        >
          Swipe Challenge
        </span>

        <h1
          className="text-[22px] font-bold mt-2"
          style={{ color: "var(--on-surface)" }}
        >
          {stage.question}
        </h1>
      </div>

      <div className="flex justify-center">
        <motion.div
          drag={disabled ? false : "x"}
          dragElastic={0.15}
          dragConstraints={{ left: 0, right: 0 }}
          style={{
            x,
            rotate,
            background: "var(--surface-container-low)",
            boxShadow: "0 20px 50px rgba(0,0,0,.12)",
          }}
          onDragEnd={(_, info) => {
            if (disabled) return;

            if (info.offset.x > SWIPE_THRESHOLD) {
              finish("right");
            } else if (info.offset.x < -SWIPE_THRESHOLD) {
              finish("left");
            } else {
              resetCard();
            }
          }}
          className="relative w-[320px] h-[430px] rounded-[30px] overflow-hidden select-none cursor-grab active:cursor-grabbing"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 24,
          }}
        >
          {/* LEFT */}
          <motion.div
            style={{ opacity: leftOpacity }}
            className="absolute left-5 top-5 z-20 rounded-full px-4 py-2 font-bold"
          >
            <span style={{ color: "var(--error)" }}>
              ← {stage.left.label}
            </span>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            style={{ opacity: rightOpacity }}
            className="absolute right-5 top-5 z-20 rounded-full px-4 py-2 font-bold"
          >
            <span style={{ color: "var(--secondary)" }}>
              {stage.right.label} →
            </span>
          </motion.div>

          <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
            {stage.card.image ? (
              <div className="relative w-40 h-40 overflow-hidden rounded-2xl">
                <Image
                  src={stage.card.image}
                  alt={stage.card.title || "Swipe card image"}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            ) : (
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 82,
                  color: "var(--outline)",
                }}
              >
                swipe
              </span>
            )}

            <div className="space-y-3">
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--on-surface)" }}
              >
                {stage.card.title}
              </h2>

              {stage.card.subtitle && (
                <p
                  className="text-base"
                  style={{
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {stage.card.subtitle}
                </p>
              )}

              <p
                className="text-lg leading-relaxed"
                style={{ color: "var(--on-surface)" }}
              >
                {stage.statement}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <div
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: "var(--error)" }}
        >
          <span className="material-symbols-outlined">
            keyboard_double_arrow_left
          </span>

          {stage.left.label}
        </div>

        <div
          className="flex items-center gap-2 text-lg font-semibold"
          style={{ color: "var(--secondary)" }}
        >
          {stage.right.label}

          <span className="material-symbols-outlined">
            keyboard_double_arrow_right
          </span>
        </div>
      </div>
    </div>
  );
}