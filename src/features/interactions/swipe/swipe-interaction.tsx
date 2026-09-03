"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { SwipeStage } from "@/types/gameplay";

const SWIPE_THRESHOLD = 120;

type Props = {
  stage: SwipeStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
  retryCount?: number;
  showIntro?: boolean;
  onIntroComplete?: () => void;
};

type Direction = "left" | "right";

export function SwipeInteractionPlaceholder({
  stage,
  onAnswer,
  disabled,
  retryCount = 0,
  showIntro = true,
  onIntroComplete,
}: Props) {
  const answered = useRef(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-10, 10]);
  const leftOpacity = useTransform(x, [-140, -30], [1, 0]);
  const rightOpacity = useTransform(x, [30, 140], [0, 1]);

  useEffect(() => {
    answered.current = false;

    animate(x, 0, {
      type: "spring",
      stiffness: 320,
      damping: 24,
    });
  }, [retryCount, stage.id, x]);

  function startGame() {
    if (disabled) return;
    onIntroComplete?.();
  }

  function resetCard() {
    animate(x, 0, {
      type: "spring",
      stiffness: 320,
      damping: 24,
    });
  }

  function finish(direction: Direction) {
    if (disabled || answered.current) return;

    answered.current = true;

    animate(x, direction === "right" ? 620 : -620, {
      duration: 0.24,
      ease: "easeIn",
    });

    const correct = direction === stage.correctDirection;

    setTimeout(() => {
      onAnswer({
        correct,
        feedback: correct
          ? stage.feedback.correct
          : stage.feedback.incorrect,
      });
    }, 190);
  }

  if (showIntro) {
    return <SwipeIntro stage={stage} onStart={startGame} />;
  }

  return (
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden bg-[#f6f2ec] px-4 pb-4 pt-4 text-[#0b0b0f]">
      <div className="flex shrink-0 flex-col items-center gap-2 text-center">
        <span className="inline-flex rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_#0b0b0f]">
          Swipe Challenge
        </span>
        <h1 className="font-display max-w-[360px] text-[27px] leading-none">
          {stage.question}
        </h1>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-center py-4">
        <div className="relative flex min-w-0 justify-center px-3">
          <motion.div
            className="pointer-events-none absolute left-0 top-8 z-10 rounded-[4px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-3 py-1 text-[12px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_rgba(11,11,15,0.16)]"
            style={{ opacity: leftOpacity, rotate: -8 }}
          >
            {stage.left.label}
          </motion.div>

          <motion.div
            className="pointer-events-none absolute right-0 top-8 z-10 rounded-[4px] border-[3px] border-[#0b0b0f] bg-[#85cb57] px-3 py-1 text-[12px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_rgba(11,11,15,0.16)]"
            style={{ opacity: rightOpacity, rotate: 8 }}
          >
            {stage.right.label}
          </motion.div>

          <motion.div
            drag={disabled ? false : "x"}
            dragElastic={0.16}
            dragConstraints={{ left: 0, right: 0 }}
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
            className="relative grid h-[min(58dvh,430px)] min-h-[350px] w-full max-w-[330px] cursor-grab select-none grid-rows-[44%_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] text-left shadow-[0_8px_0_rgba(11,11,15,0.16)] active:cursor-grabbing"
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 24,
            }}
            style={{ x, rotate, touchAction: "pan-y" }}
          >
            <SwipeCardMedia
              image={stage.card.image}
              title={stage.card.title}
              className="h-full border-b-[3px] border-[#0b0b0f]"
            />

            <div className="flex min-h-0 flex-col justify-center px-5 py-4 text-center">
              {stage.card.subtitle ? (
                <span className="mx-auto mb-3 max-w-full rounded-[4px] border border-[#0b0b0f] bg-[#f5f0e9] px-2 py-1 text-[12px] font-extrabold leading-none text-[#343238]">
                  {stage.card.subtitle}
                </span>
              ) : null}

              <h2 className="text-[24px] font-extrabold leading-tight">
                {stage.card.title}
              </h2>

              <p className="mt-4 text-[18px] font-semibold leading-snug text-[#0b0b0f]">
                {stage.statement}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3">
        <ChoiceHint direction="left" label={stage.left.label} />
        <ChoiceHint direction="right" label={stage.right.label} />
      </div>
    </div>
  );
}

function SwipeIntro({
  stage,
  onStart,
}: {
  stage: SwipeStage;
  onStart: () => void;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden bg-[#f6f2ec] px-5 pb-12 pt-8 text-[#0b0b0f]">
      <div className="absolute left-1/2 top-[15%] h-[320px] w-[3px] -translate-x-1/2 rounded-full bg-[#d8d0c3]" />
      <motion.div
        aria-hidden
        className="absolute left-[16%] top-[29%] rounded-[4px] border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-3 py-1 text-[12px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_rgba(11,11,15,0.16)]"
        initial={{ opacity: 0, x: 18, rotate: -8 }}
        animate={{ opacity: [0, 1, 0.65], x: [18, -4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8 }}
      >
        {stage.left.label}
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute right-[16%] top-[29%] rounded-[4px] border-[3px] border-[#0b0b0f] bg-[#85cb57] px-3 py-1 text-[12px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_rgba(11,11,15,0.16)]"
        initial={{ opacity: 0, x: -18, rotate: 8 }}
        animate={{ opacity: [0.65, 1, 0], x: [0, 4, -18] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          repeatDelay: 0.8,
          delay: 0.9,
        }}
      >
        {stage.right.label}
      </motion.div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <motion.div
          className="mb-8 inline-flex rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7] px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-[0_3px_0_rgba(11,11,15,0.18)]"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
        >
          Swipe Challenge
        </motion.div>

        <div className="relative mb-8 flex h-[230px] w-full max-w-[360px] justify-center">
          <motion.div
            className="grid h-[210px] w-[176px] grid-rows-[116px_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] shadow-[0_8px_0_rgba(11,11,15,0.16)]"
            initial={{ opacity: 0, y: 18, rotate: 0 }}
            animate={{
              opacity: 1,
              y: [18, 0, 0, 0],
              rotate: [0, -4, 4, 0],
            }}
            transition={{
              opacity: { duration: 0.22 },
              y: { duration: 0.35, ease: [0.2, 0.9, 0.2, 1] },
              rotate: { duration: 2.6, repeat: Infinity, repeatDelay: 0.4 },
            }}
          >
            <SwipeCardMedia
              image={stage.card.image}
              title={stage.card.title}
              className="h-full border-b-[3px] border-[#0b0b0f]"
            />
            <div className="flex min-h-0 flex-col justify-center px-3 py-2 text-center">
              <span className="text-[16px] font-extrabold leading-tight">
                {stage.card.title}
              </span>
              <span className="mt-1 text-[12px] font-bold leading-tight text-[#343238]">
                Decide fast
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.28 }}
        >
          <h1 className="font-display mx-auto max-w-[360px] text-[30px] leading-none">
            {stage.question}
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] text-[15px] font-semibold leading-snug text-[#343238]">
            Read the card, then swipe left for {stage.left.label} or right for{" "}
            {stage.right.label}.
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        className="relative h-14 w-full max-w-[340px] self-center rounded-full border-[3px] border-[#0b0b0f] bg-[#85cb57] text-[16px] font-extrabold text-[#0b0b0f] shadow-[0_4px_0_#0b0b0f]"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0 #0b0b0f" }}
        transition={{ delay: 0.52, duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
      >
        Play
      </motion.button>
    </div>
  );
}

function SwipeCardMedia({
  image,
  title,
  className,
}: {
  image?: string;
  title: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt=""
        onError={() => setImageFailed(true)}
        className={`w-full object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex w-full flex-col items-center justify-center bg-[#eadfd1] ${className ?? ""}`}
      aria-label={title}
    >
      <span className="material-symbols-outlined text-[56px]">swipe</span>
      <span className="mt-1 text-[11px] font-extrabold uppercase text-[#343238]">
        Swipe Card
      </span>
    </div>
  );
}

function ChoiceHint({
  direction,
  label,
}: {
  direction: Direction;
  label: string;
}) {
  const isLeft = direction === "left";

  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-md border-[3px] border-[#0b0b0f] px-3 py-2 text-[13px] font-extrabold shadow-[0_4px_0_rgba(11,11,15,0.14)] ${
        isLeft ? "bg-[#fffdf7]" : "bg-[#85cb57]"
      }`}
    >
      {isLeft ? (
        <span className="material-symbols-outlined text-[18px]">
          keyboard_double_arrow_left
        </span>
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
      {!isLeft ? (
        <span className="material-symbols-outlined ml-auto text-[18px]">
          keyboard_double_arrow_right
        </span>
      ) : null}
    </div>
  );
}
