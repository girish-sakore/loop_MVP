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

// Matchbox theme slot for this game (index of "swipe" in the game order).
const THEME = { ["--c" as string]: "var(--mb-t0)", ["--f" as string]: "var(--mb-tf0)" };

// Shared look: ink outline + hard offset shadow.
const INK = "border-2 border-[var(--mb-ink)]";
const HARD = "shadow-[3px_3px_0_var(--mb-sh)]";

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
    <div className="flex h-[calc(100dvh-86px)] w-full flex-col overflow-hidden px-4 pb-4 pt-4 text-[var(--mb-onbg)]">
      <div className="flex shrink-0 flex-col items-center gap-3 text-center">
        <Tag>Swipe Challenge</Tag>
        <h1 className="max-w-[360px] text-[24px] font-bold leading-tight tracking-[-0.01em]">
          {stage.question}
        </h1>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-center py-4">
        <div className="relative flex min-w-0 justify-center px-3">
          <motion.div
            className={`pointer-events-none absolute left-0 top-8 z-20 rounded-md ${INK} bg-[var(--mb-cream)] px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-[var(--mb-ink)] ${HARD}`}
            style={{ opacity: leftOpacity, rotate: -8 }}
          >
            {stage.left.label}
          </motion.div>

          <motion.div
            className={`pointer-events-none absolute right-0 top-8 z-20 rounded-md ${INK} bg-[var(--mb-yel)] px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-[var(--mb-ink)] ${HARD}`}
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
            className={`relative grid h-[min(58dvh,430px)] min-h-[350px] w-full max-w-[330px] cursor-grab select-none grid-rows-[70%_minmax(0,1fr)] overflow-hidden rounded-xl ${INK} bg-[var(--c)] text-left shadow-[4px_4px_0_var(--mb-sh)] active:cursor-grabbing`}
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 24,
            }}
            style={{ x, rotate, touchAction: "pan-y", ...THEME }}
          >
            <Strikes />
            <SwipeCardMedia
              image={stage.card.image}
              title={stage.card.title}
              className="h-full border-b-2 border-[var(--mb-ink)]"
            />

            <div className="flex min-h-0 flex-col justify-center bg-[var(--mb-cream)] px-6 py-4 text-center text-[var(--mb-ink)]">
              {stage.card.subtitle ? (
                <span className="mx-auto mb-3 max-w-full rounded-full border-[1.5px] border-[var(--mb-ink)] bg-[var(--mb-dcream)] px-3 py-1 text-[12px] font-bold leading-none">
                  {stage.card.subtitle}
                </span>
              ) : null}

              <h2 className="text-[24px] font-bold leading-tight">
                {stage.card.title}
              </h2>

              <p className="mt-3 text-[17px] font-medium leading-snug">
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
    <div className="relative flex min-h-[calc(100dvh-86px)] flex-col overflow-hidden px-5 pb-12 pt-8 text-[var(--mb-onbg)]">
      <div className="absolute left-1/2 top-[15%] h-[320px] w-[2px] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--mb-onbg)_25%,transparent)]" />
      <motion.div
        aria-hidden
        className={`absolute left-[16%] top-[29%] rounded-md ${INK} bg-[var(--mb-cream)] px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-[var(--mb-ink)] ${HARD}`}
        initial={{ opacity: 0, x: 18, rotate: -8 }}
        animate={{ opacity: [0, 1, 0.65], x: [18, -4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8 }}
      >
        {stage.left.label}
      </motion.div>
      <motion.div
        aria-hidden
        className={`absolute right-[16%] top-[29%] rounded-md ${INK} bg-[var(--mb-yel)] px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-[var(--mb-ink)] ${HARD}`}
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
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
          className="mb-8"
        >
          <Tag>Swipe Challenge</Tag>
        </motion.div>

        <div className="relative mb-8 flex h-[230px] w-full max-w-[360px] justify-center">
          <motion.div
            className={`relative grid h-[210px] w-[176px] grid-rows-[116px_minmax(0,1fr)] overflow-hidden rounded-xl ${INK} bg-[var(--c)] shadow-[4px_4px_0_var(--mb-sh)]`}
            style={THEME}
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
            <Strikes />
            <SwipeCardMedia
              image={stage.card.image}
              title={stage.card.title}
              className="h-full border-b-2 border-[var(--mb-ink)]"
            />
            <div className="flex min-h-0 flex-col justify-center bg-[var(--mb-cream)] px-4 py-2 text-center text-[var(--mb-ink)]">
              <span className="text-[16px] font-bold leading-tight">
                {stage.card.title}
              </span>
              <span className="mt-1 text-[12px] font-medium leading-tight opacity-70">
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
          <h1 className="mx-auto max-w-[360px] text-[26px] font-bold leading-tight tracking-[-0.01em]">
            {stage.question}
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] text-[15px] font-medium leading-snug opacity-80">
            Read the card, then swipe left for {stage.left.label} or right for{" "}
            {stage.right.label}.
          </p>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        className={`relative h-14 w-full max-w-[340px] self-center rounded-xl ${INK} bg-[var(--mb-yel)] text-[15px] font-bold tracking-[0.08em] text-[var(--mb-ink)] ${HARD}`}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ x: 2, y: 2 }}
        transition={{ delay: 0.52, duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
      >
        PLAY
      </motion.button>
    </div>
  );
}

/** Matchbox strike strips down both edges of a card. */
function Strikes() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[6px] bg-[var(--mb-strike)]" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[6px] bg-[var(--mb-strike)]" />
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-full ${INK} bg-[var(--mb-cream)] px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--mb-ink)] shadow-[2px_2px_0_var(--mb-sh)]`}>
      {children}
    </span>
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
      className={`flex w-full flex-col items-center justify-center bg-[var(--mb-dcream)] text-[var(--mb-ink)] ${className ?? ""}`}
      aria-label={title}
    >
      <span className="material-symbols-outlined text-[56px]">swipe</span>
      <span className="mt-1 text-[11px] font-bold uppercase tracking-wider opacity-70">
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
      className={`flex min-w-0 items-center gap-2 rounded-xl ${INK} px-3 py-3 text-[14px] font-bold text-[var(--mb-ink)] ${HARD} ${
        isLeft ? "bg-[var(--mb-cream)]" : "bg-[var(--mb-yel)]"
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