"use client";

// features/gameplay/progress/use-progress-sync.ts
//
// Pushes/pulls STAGE-LEVEL progress only (stage, score, attempts, hints).
// interactionState never travels through here.

import { useCallback, useEffect, useRef } from "react";
import { toServerPayload, fromServerPayload, saveSnapshot, type GameplaySnapshot } from "./resume";

const PULL_INTERVAL_MS = 30_000;

type Options = {
  editionId: string;
  nodeId: string;
  storageKey: string;
  /** Turn syncing on only after the initial restore has finished. */
  enabled: boolean;
  /** Ephemeral runs (replays) never persist: no localStorage, no network. */
  ephemeral?: boolean;
  /** Called with the server's merged view after every push and pull. */
  onRemote: (remote: GameplaySnapshot) => void;
};

export function useProgressSync({ editionId, nodeId, storageKey, enabled, ephemeral = false, onRemote }: Options) {
  const onRemoteRef = useRef(onRemote);
  useEffect(() => { onRemoteRef.current = onRemote; });

  const pending = useRef<GameplaySnapshot | null>(null);

  const post = useCallback(async (snapshot: GameplaySnapshot) => {
    if (ephemeral) return;
    try {
      const res = await fetch("/api/progress/sync", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId, nodeId, ...toServerPayload(snapshot) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(() => null);
      const remote = fromServerPayload(data?.progress);
      if (remote) onRemoteRef.current(remote);
      pending.current = null;
    } catch {
      // Offline or server error: keep it queued and retry on focus/online/next save.
      pending.current = snapshot;
    }
  }, [editionId, nodeId, ephemeral]);

  const flush = useCallback(() => {
    const snapshot = pending.current;
    if (!snapshot) return;
    void post(snapshot);
  }, [post]);

  /** Local write is always immediate. Call only on discrete stage events. */
  const save = useCallback((snapshot: GameplaySnapshot) => {
    if (!ephemeral) {
      try { saveSnapshot(localStorage, storageKey, snapshot); } catch { /* storage blocked */ }
    }
    void post(snapshot);
  }, [storageKey, post, ephemeral]);

  const pull = useCallback(async () => {
    if (ephemeral) return;
    try {
      const params = new URLSearchParams({ editionId, nodeId });
      const res = await fetch(`/api/progress/sync?${params}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      const remote = fromServerPayload(data?.progress);
      if (remote) onRemoteRef.current(remote);
    } catch { /* offline: try again later */ }
  }, [editionId, nodeId]);

  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      flush();
      if (document.visibilityState === "visible") void pull();
    };
    const onOnline = () => { flush(); void pull(); };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void pull();
    }, PULL_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, [enabled, flush, pull]);

  return { save, pull, flush };
}