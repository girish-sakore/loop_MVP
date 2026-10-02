"use client";

// features/gameplay/engine/gameplay-engine.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { InteractionRenderer } from "@/features/gameplay/renderer/interaction-renderer";
import { GameplayShell } from "@/features/gameplay/shell/gameplay-shell";
import { useGameplayStore } from "@/stores/gameplay-store";
import { useProgressSync } from "@/features/gameplay/progress/use-progress-sync";
import {
  DEFAULT_HINT_BUDGET,
  SNAPSHOT_VERSION,
  compareProgress,
  mergeSnapshots,
  normalizeSnapshot,
  pickSnapshot,
  progressStorageKey,
  restoreSnapshot,
  saveSnapshot,
  type GameplaySnapshot,
  type InteractionState,
  type StoredProgress,
} from "@/features/gameplay/progress/resume";
import type { Stage } from "@/types/gameplay";

interface GameplayEngineProps {
  editionId: string;
  nodeId: string;
  stages: Stage[];
  initialStage?: number;
  initialProgress?: StoredProgress;
  userId: string;
  /**
   * When set (daily games), completion routes to `/summary?gameKey=<key>` so
   * the summary can offer a replay. Absent for regular edition nodes, which
   * keep routing to the plain `/summary`.
   */
  gameKey?: string;
  /**
   * Ephemeral runs (daily-game replays) persist nothing: no localStorage,
   * no /api/progress/sync, no /api/progress/complete.
   */
  ephemeral?: boolean;
}

export function GameplayEngine({
  editionId, nodeId, userId, stages, initialStage = 0, initialProgress, gameKey, ephemeral = false }: GameplayEngineProps) {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [initializedKey, setInitializedKey] = useState<string | null>(null);
  const answerLocked = useRef(true);
  const [retryCount, setRetryCount] = useState(0);
  // Bumped when another device is ahead, so the game remounts with the new state.
  const [epoch, setEpoch] = useState(0);
  const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean; message: string }>(
    { open: false, correct: false, message: "" });
  const [introState, setIntroState] = useState<{ key: string; dismissed: boolean } | null>(null);
  const {
    currentStage,
    attemptsRemaining,
    score,
    correctAnswers,
    totalAnswers,
    completed,
    hintsRemaining,
    interactionState,
    restore,
    registerResult,
    nextStage,
    setInteractionState,
    clearInteractionState,
    consumeHint,
    applyRemoteHints,
  } = useGameplayStore();

  const stage = stages[currentStage];
  const totalAttempts = stage?.attemptsAllowed ?? 3;
  const progress = useMemo(() => (currentStage / stages.length) * 100, [currentStage, stages.length]);
  const gameplayKey = progressStorageKey(userId, editionId, nodeId);
  const legacyHintsKey = `loop_hints_${userId}_${editionId}_${nodeId}`;
  const introDismissed = introState?.key === gameplayKey ? introState.dismissed : false;
  const ready = initializedKey === gameplayKey;

  const applySnapshot = useCallback((snapshot: GameplaySnapshot) => {
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
    const started = snapshot.totalAnswers > 0 || snapshot.currentStage > 0;
    setIntroState((prev) => ({
      key: gameplayKey,
      dismissed: (prev?.key === gameplayKey && prev.dismissed) || started,
    }));
  }, [restore, gameplayKey]);

  const handleRemote = useCallback((remote: GameplaySnapshot) => {
    if (hasNavigated.current) return;
    const local = pickSnapshot(useGameplayStore.getState());
    if (compareProgress(remote, local) > 0) {
      // Another device is further along: adopt it and remount the game.
      // The stage differs from what we had, so drop any local game-in-progress
      // state — it belonged to the old stage.
      const merged = { ...mergeSnapshots(local, remote), interactionState: {} };
      applySnapshot(merged);
      if (!ephemeral) {
        try { saveSnapshot(localStorage, gameplayKey, merged); } catch { /* storage blocked */ }
      }
      setEpoch((e) => e + 1);
    } else if (remote.hintsRemaining < local.hintsRemaining) {
      applyRemoteHints(remote.hintsRemaining);
    }
  }, [applySnapshot, applyRemoteHints, gameplayKey, ephemeral]);

  const { save, flush } = useProgressSync({
    editionId,
    nodeId,
    storageKey: gameplayKey,
    enabled: ready,
    ephemeral,
    onRemote: handleRemote,
  });

  // Stage-level change: local write + network push.
  const syncStage = useCallback(() => save(pickSnapshot(useGameplayStore.getState())), [save]);

  // Game-state change (typing, hopping...): local only, no network call.
  const saveLocalOnly = useCallback(() => {
    if (ephemeral) return;
    try { saveSnapshot(localStorage, gameplayKey, pickSnapshot(useGameplayStore.getState())); } catch { /* storage blocked */ }
  }, [gameplayKey, ephemeral]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      // Ephemeral runs (replays) start completely fresh: no saved progress is
      // read, and nothing is written to localStorage or the network.
      if (ephemeral) {
        applySnapshot({
          version: SNAPSHOT_VERSION,
          updatedAt: 0,
          currentStage: initialStage,
          attemptsRemaining: stages[initialStage]?.attemptsAllowed ?? 0,
          stagePassed: false,
          score: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          hintsRemaining: DEFAULT_HINT_BUDGET,
          interactionState: {},
        });
        setInitializedKey(gameplayKey);
        return;
      }

      let legacyHints: number | undefined;
      try {
        const raw = localStorage.getItem(legacyHintsKey);
        const parsed = raw === null ? NaN : parseInt(raw, 10);
        if (Number.isSafeInteger(parsed) && parsed >= 0) legacyHints = parsed;
      } catch { /* storage blocked */ }
      const hintFallback = legacyHints ?? DEFAULT_HINT_BUDGET;

      const server: GameplaySnapshot = normalizeSnapshot(initialProgress, { hintsRemaining: hintFallback }) ?? {
        version: SNAPSHOT_VERSION,
        updatedAt: 0,
        currentStage: initialStage,
        attemptsRemaining: stages[initialStage]?.attemptsAllowed ?? 0,
        stagePassed: false,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        hintsRemaining: hintFallback,
        interactionState: {},
      };

      let snapshot = server;
      try {
        snapshot = restoreSnapshot(localStorage, gameplayKey, server, stages.map((item) => item.attemptsAllowed));
      } catch { /* Fall back to server progress if storage is blocked. */ }

      applySnapshot(snapshot);
      setInitializedKey(gameplayKey);
      save(snapshot);
      try { localStorage.removeItem(legacyHintsKey); } catch { /* storage blocked */ }
    });
    return () => { cancelled = true; };
  }, [stages, initialStage, initialProgress, gameplayKey, legacyHintsKey, applySnapshot, save, ephemeral]);

  const completeProgress = useCallback(async () => {
    // Ephemeral runs (replays) leave no trace: no DB completion, no storage.
    if (ephemeral) return;
    flush();
    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editionId, nodeId, score, correctAnswers, totalAnswers }),
    }).catch(() => { });
    try { localStorage.removeItem(gameplayKey); } catch { /* storage blocked */ }
  }, [editionId, nodeId, score, correctAnswers, totalAnswers, gameplayKey, flush, ephemeral]);

  useEffect(() => {
    if (!ready) return;
    if ((completed || !stage) && !hasNavigated.current) {
      hasNavigated.current = true;
      completeProgress().then(() => {
        router.push(gameKey ? `/summary?gameKey=${encodeURIComponent(gameKey)}` : "/summary");
      });
    }
  }, [ready, completed, stage, completeProgress, router, gameKey]);

  const handleInteractionStateChange = useCallback((stageId: string, state: InteractionState) => {
    setInteractionState(stageId, state);
    saveLocalOnly();
  }, [setInteractionState, saveLocalOnly]);

  function handleAnswer({
    correct,
    feedback: message,
    points,
    totalAnswers: answerCount = 1,
    correctAnswers: correctAnswerCount = correct ? 1 : 0,
  }: {
    correct: boolean;
    feedback: string;
    points?: number;
    totalAnswers?: number;
    correctAnswers?: number;
  }) {
    if (answerLocked.current) return;
    registerResult({
      correct,
      points: points ?? stage?.points ?? 0,
      totalAnswers: answerCount,
      correctAnswers: correctAnswerCount,
    });
    const snapshot = useGameplayStore.getState();
    answerLocked.current = snapshot.stagePassed || snapshot.attemptsRemaining === 0;
    setFeedback({ open: true, correct, message });
    syncStage();
  }

  function handleRetry() {
    if (answerLocked.current) return;
    clearInteractionState(stage.id);
    syncStage();
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
    syncStage();
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
    syncStage();
  }, [consumeHint, syncStage]);

  if ((completed || !stage) && hasNavigated.current) {
    return null;
  }

  if (!stage) return null;
  if (!ready) return null;

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
            key={`${stage.id}:${epoch}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <InteractionRenderer
              stage={stage}
              stages={stages}
              disabled={feedback.open}
              retryCount={retryCount}
              attemptsRemaining={attemptsRemaining}
              onAnswer={handleAnswer}
              showIntro={!introDismissed}
              onIntroComplete={() => setIntroState({ key: gameplayKey, dismissed: true })}
              hintsRemaining={hintsRemaining}
              onUseHint={handleUseHint}
              interactionState={interactionState[stage.id]}
              onInteractionStateChange={(s) => handleInteractionStateChange(stage.id, s)}
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