"use client";

import { useEffect, useMemo, useState, useCallback, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import { progressStorageKey, restoreSnapshot, saveSnapshot, type GameplaySnapshot } from "@/features/gameplay/progress/resume";
import type { Stage } from "@/types/gameplay";

const DEFAULT_HINT_BUDGET = 3;

function useSessionHints(userId: string,editionId: string, nodeId: string, initialBudget = DEFAULT_HINT_BUDGET) {
  const storageKey = `loop_hints_${userId}_${editionId}_${nodeId}`;

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
  initialProgress?: GameplaySnapshot;
  userId: string;
}
export function GameplayEngine({
  editionId, nodeId, userId, stages, initialStage = 0, initialProgress }: GameplayEngineProps) {
  const router = useRouter();
  const hasNavigated = useRef(false); // guard navigation
  const [initializedKey, setInitializedKey] = useState<string | null>(null);
  const answerLocked = useRef(true);
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
    restore,
    registerResult,
    nextStage,
  } = useGameplayStore();

  const stage = stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;
  const progress = useMemo(() => (currentStage / stages.length) * 100, [currentStage, stages.length]);
  const gameplayKey = progressStorageKey(userId, editionId, nodeId);
  const introDismissed =
    introState?.key === gameplayKey ? introState.dismissed : false;
  const { hintsRemaining, consumeHint, resetHints } = useSessionHints(userId,editionId, nodeId);

  const syncProgress = useCallback(async (snapshot: GameplaySnapshot) => {
    // Write synchronously before starting the request: refresh may interrupt it.
    try {
      saveSnapshot(localStorage, gameplayKey, snapshot);
    } catch { /* Storage access itself can be blocked by the browser. */ }
    await fetch("/api/progress/sync", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        editionId, nodeId,
        currentSubStage: snapshot.currentStage,
        attemptsRemaining: snapshot.attemptsRemaining,
        stagePassed: snapshot.stagePassed,
        score: snapshot.score,
        correctAnswers: snapshot.correctAnswers,
        totalAnswers: snapshot.totalAnswers,
      }),
    }).catch(() => { });
  }, [editionId, nodeId, gameplayKey]);

  // Restore before mounting an interaction; never replenish a saved zero.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const server: GameplaySnapshot = initialProgress ?? {
        currentStage: initialStage,
        attemptsRemaining: stages[initialStage]?.attemptsAllowed ?? 0,
        stagePassed: false,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      };
      let snapshot = server;
      try {
        snapshot = restoreSnapshot(localStorage, gameplayKey, server, stages.map((item) => item.attemptsAllowed));
      } catch { /* Fall back to server progress if storage is blocked. */ }
      restore(snapshot);
      hasNavigated.current = false;
      const locked = snapshot.stagePassed || snapshot.attemptsRemaining === 0;
      answerLocked.current = locked;
      setFeedback({
        open: locked,
        correct: snapshot.stagePassed,
        message: snapshot.stagePassed
          ? "You already completed this stage. Continue to the next one."
          : locked ? "No attempts remaining for this stage." : "",
      });
      setIntroState({ key: gameplayKey, dismissed: snapshot.totalAnswers > 0 || snapshot.currentStage > 0 });
      setInitializedKey(gameplayKey);
      // Flush a browser backup that was saved just before a reload.
      void syncProgress(snapshot);
    });
    return () => { cancelled = true; };
  }, [stages, initialStage, initialProgress, restore, gameplayKey, syncProgress]);

  const completeProgress = useCallback(async () => {
    resetHints();
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editionId, nodeId, score, correctAnswers, totalAnswers }),
    }).catch(() => { });
  }, [editionId, nodeId, score, correctAnswers, totalAnswers, resetHints]);

  // Issue 2 fix — navigate in an effect, never during render
  useEffect(() => {
    if (initializedKey !== gameplayKey) return;
    if ((completed || !stage) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        router.push("/summary");
      });
    }
  }, [gameplayKey, initializedKey, completed, stage, completeProgress, router]);

  function handleAnswer({
    correct,
    feedback: message,
  }: {
    correct: boolean;
    feedback: string;
  }) {
    if (answerLocked.current) return;
    registerResult({ correct, points: stage?.points ?? 0 });
    const snapshot = useGameplayStore.getState();
    answerLocked.current = snapshot.stagePassed || snapshot.attemptsRemaining === 0;
    setFeedback({ open: true, correct, message });
    void syncProgress({
      currentStage: snapshot.currentStage,
      attemptsRemaining: snapshot.attemptsRemaining,
      stagePassed: snapshot.stagePassed,
      score: snapshot.score,
      correctAnswers: snapshot.correctAnswers,
      totalAnswers: snapshot.totalAnswers,
    });
  }

  function handleRetry() {
    if (answerLocked.current) return;
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
    answerLocked.current = false;
    const after = useGameplayStore.getState();
    await syncProgress({
      currentStage: after.currentStage,
      attemptsRemaining: after.attemptsRemaining,
      stagePassed: false,
      score: after.score,
      correctAnswers: after.correctAnswers,
      totalAnswers: after.totalAnswers,
    });
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
