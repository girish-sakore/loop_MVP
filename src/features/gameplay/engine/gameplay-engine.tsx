"use client";

import { useEffect, useMemo, useState, useCallback, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import type { Stage } from "@/types/gameplay";

const DEFAULT_HINT_BUDGET = 3;

// Hints are now scoped to (userId, editionId) only — NOT nodeId — so the
// same pool is shared across every game/node inside an edition. The count
// persists across node navigation via localStorage and only clears when
// resetHints() is explicitly called (see isLastNode handling below).
function useSessionHints(userId: string, editionId: string, initialBudget = DEFAULT_HINT_BUDGET) {
  const storageKey = `loop_hints_${userId}_${editionId}`;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === storageKey || e.key === null) {
          onStoreChange();
        }
      };
      window.addEventListener("storage", handleStorage);
      const handleCustom = () => onStoreChange();
      window.addEventListener("loop_hints_change", handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("loop_hints_change", handleCustom);
      };
    },
    [storageKey],
  );

  const getSnapshot = useCallback(() => {
    try {
      const val = localStorage.getItem(storageKey);
      if (val !== null) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= initialBudget) {
          return parsed;
        }
      }
    } catch { }
    return initialBudget;
  }, [storageKey, initialBudget]);

  const getServerSnapshot = useCallback(() => initialBudget, [initialBudget]);

  const hintsRemaining = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const consumeHint = useCallback(() => {
    try {
      const val = localStorage.getItem(storageKey);
      const current = val !== null ? parseInt(val, 10) : initialBudget;
      const validCurrent = !isNaN(current) ? current : initialBudget;
      const next = Math.max(validCurrent - 1, 0);
      localStorage.setItem(storageKey, String(next));
      window.dispatchEvent(new Event("loop_hints_change"));
    } catch { }
  }, [storageKey, initialBudget]);

  const resetHints = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event("loop_hints_change"));
    } catch { }
  }, [storageKey]);

  return { hintsRemaining, consumeHint, resetHints };
}

interface GameplayEngineProps {
  editionId: string;
  nodeId: string;
  stages: Stage[];
  initialStage?: number;
  userId: string;
  // Pass true when this node is the last node in the edition, so the
  // shared hint pool clears once the whole edition is finished rather
  // than after every individual node.
  isLastNode?: boolean;
}
export function GameplayEngine({
  editionId, nodeId, userId, stages, initialStage = 0, isLastNode = false }: GameplayEngineProps) {
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
  const { hintsRemaining, consumeHint, resetHints } = useSessionHints(userId, editionId);

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
    }).catch(() => { });
  }, [editionId, nodeId, currentStage, score, correctAnswers, totalAnswers]);

  const completeProgress = useCallback(async () => {
    // Only clear the shared hint pool once the whole edition is done —
    // not on every individual node's completion.
    if (isLastNode) resetHints();
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editionId, nodeId, score, correctAnswers, totalAnswers }),
    }).catch(() => { });
  }, [editionId, nodeId, score, correctAnswers, totalAnswers, resetHints, isLastNode]);

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

  const handleUseHint = useCallback(() => {
    consumeHint();
  }, [consumeHint]);

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
              hintsRemaining={hintsRemaining}
              onUseHint={handleUseHint}
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