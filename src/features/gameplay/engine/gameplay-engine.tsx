"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import type { Stage } from "@/types/gameplay";

interface GameplayEngineProps {
  editionId: string;
  nodeId: string;
  stages: Stage[];
  initialStage?: number;
}
export function GameplayEngine({
  editionId, nodeId, stages, initialStage = 0 }: GameplayEngineProps) {
  const router = useRouter();
  const hasNavigated = useRef(false); // guard navigation
  const initializedKey = useRef<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    correct: boolean;
    message: string;
  }>({ open: false, correct: false, message: "" });
  const [introState, setIntroState] = useState<{
    key: string;
    dismissed: boolean;
  } | null>(null);
  const {
    currentStage,
    attemptsRemaining,
    score,
    correctAnswers,
    totalAnswers,
    completed,
    setAttempts,
    setStage,
    registerResult,
    nextStage,
    reset,
  } = useGameplayStore();

  const stage = stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;
  const progress = useMemo(() => (currentStage / stages.length) * 100, [currentStage, stages.length]);
  const gameplayKey = `${editionId}:${nodeId}:${initialStage}`;
  const introDismissed =
    introState?.key === gameplayKey ? introState.dismissed : false;

  // initialize from DB progress, not always 0
  useEffect(() => {
    let cancelled = false;
    initializedKey.current = null;
    hasNavigated.current = false;
    reset();
    setStage(initialStage);
    setAttempts(stages[initialStage]?.attemptsAllowed ?? stages[0]?.attemptsAllowed ?? 0);
    queueMicrotask(() => {
      if (!cancelled) initializedKey.current = gameplayKey;
    });

    return () => {
      cancelled = true;
    };
  }, [stages, initialStage, reset, setStage, setAttempts, gameplayKey]);

  const syncProgress = useCallback(async (overrides?: {
    score?: number;
    correctAnswers?: number;
    totalAnswers?: number;
    currentStage?: number;
  }) => {
    await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        editionId, nodeId,
        currentSubStage: overrides?.currentStage ?? currentStage,
        score: overrides?.score ?? score,
        correctAnswers: overrides?.correctAnswers ?? correctAnswers,
        totalAnswers: overrides?.totalAnswers ?? totalAnswers,
      }),
    }).catch(() => {});
  }, [editionId, nodeId, currentStage, score, correctAnswers, totalAnswers]);

  const completeProgress = useCallback(async () => {
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editionId, nodeId, score, correctAnswers, totalAnswers }),
    }).catch(() => {});
  }, [editionId, nodeId, score, correctAnswers, totalAnswers]);

  // Issue 2 fix — navigate in an effect, never during render
  useEffect(() => {
    if (initializedKey.current !== gameplayKey) return;
    if ((completed || !stage) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        router.push("/summary");
      });
    }
  }, [gameplayKey, completed, stage, completeProgress, router]);

  function handleAnswer({
    correct,
    feedback: message,
  }: {
    correct: boolean;
    feedback: string;
  }) {
    registerResult({ correct, points: stage?.points ?? 0 });
    setFeedback({ open: true, correct, message });
  }

  function handleRetry() {
    setRetryCount((c) => c + 1);
    setFeedback({ open: false, correct: false, message: "" });
  }

  function handleSkip() {
    setFeedback((s) => ({ ...s, open: false }));
    if (!stage) return;
    advanceStage();
  }

  async function advanceStage() {
    const nextIndex = currentStage + 1;
    const nextAttempts = stages[nextIndex]?.attemptsAllowed ?? 0;
    nextStage(stages.length, nextAttempts);
    if (nextIndex < stages.length) syncProgress({ currentStage: nextIndex });
  }

  async function handleContinue() {
    setFeedback((s) => ({ ...s, open: false }));
    if (!stage) return;
    if (feedback.correct || attemptsRemaining <= 0) {
      await advanceStage();
    }
  }

  // While navigating away, render nothing
  if ((completed || !stage) && hasNavigated.current) {
    return null;
  }

  if (!stage) return null;

  return (
    <>
      <GameplayShell
        stageLabel={`Stage ${currentStage + 1} of ${stages.length}`}
        progress={progress}
        attemptsRemaining={attemptsRemaining}
        totalAttempts={totalAttempts}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <InteractionRenderer
              stage={stage}
              disabled={feedback.open}
              retryCount={retryCount}
              onAnswer={handleAnswer}
              showIntro={!introDismissed}
              onIntroComplete={() =>
                setIntroState({ key: gameplayKey, dismissed: true })
              }
            />
          </motion.div>
        </AnimatePresence>
      </GameplayShell>

      <FeedbackModal
        open={feedback.open}
        correct={feedback.correct}
        message={feedback.message}
        attemptsRemaining={attemptsRemaining}
        onContinue={handleContinue}
        onRetry={handleRetry}
        onSkip={handleSkip}
      />
    </>
  );
}
