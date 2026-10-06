import {
  normalizeSnapshot,
  progressStorageKey,
  toServerPayload,
  type GameplaySnapshot,
} from "./resume";

export const PENDING_COMPLETION_PREFIX = "loop_pending_completion_";
export const MAX_PENDING_COMPLETION_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const pendingRetries = new Map<string, Promise<boolean>>();

export type PendingCompletion = {
  userId: string;
  gameId: string;
  progressKey: string;
  createdAt: number;
};

export function pendingCompletionKey(userId: string, gameId: string) {
  return `${PENDING_COMPLETION_PREFIX}${JSON.stringify([userId, gameId])}`;
}

export function markPendingCompletion(
  storage: Pick<Storage, "setItem">,
  userId: string,
  gameId: string,
): string {
  const progressKey = progressStorageKey(userId, gameId);
  const key = pendingCompletionKey(userId, gameId);
  storage.setItem(key, JSON.stringify({ userId, gameId, progressKey, createdAt: Date.now() }));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("loop:pending-completion"));
  }
  return key;
}

export function listPendingCompletions(storage: Pick<Storage, "length" | "key" | "getItem">) {
  const pending: Array<{ key: string; value: PendingCompletion }> = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key?.startsWith(PENDING_COMPLETION_PREFIX)) continue;
    try {
      const value = JSON.parse(storage.getItem(key) ?? "null") as PendingCompletion | null;
      if (
        value && typeof value.userId === "string" && typeof value.gameId === "string" &&
        value.progressKey === progressStorageKey(value.userId, value.gameId)
      ) {
        pending.push({ key, value });
      }
    } catch {
      // Leave malformed markers untouched for diagnosis instead of dropping work.
    }
  }
  return pending;
}

export function pruneExpiredPendingCompletions(storage: Storage, now = Date.now()) {
  for (const { key } of listPendingCompletions(storage)) {
    try {
      const marker = JSON.parse(storage.getItem(key) ?? "null") as PendingCompletion | null;
      if (
        !marker || !Number.isSafeInteger(marker.createdAt) || marker.createdAt <= 0 ||
        marker.createdAt > now + 5 * 60 * 1000 ||
        now - marker.createdAt > MAX_PENDING_COMPLETION_AGE_MS
      ) {
        storage.removeItem(key);
      }
    } catch {
      // A malformed marker cannot safely make an API request; discard it.
      try { storage.removeItem(key); } catch { /* Storage may be blocked. */ }
    }
  }
}

export function retryPendingCompletion(
  markerKey: string,
  storage: Storage = localStorage,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const existing = pendingRetries.get(markerKey);
  if (existing) return existing;

  const retry = (async () => {
    let marker: PendingCompletion;
    let snapshot: GameplaySnapshot | null;
    try {
      const rawMarker = storage.getItem(markerKey);
      if (!rawMarker) return true;
      marker = JSON.parse(rawMarker) as PendingCompletion;
      if (marker.progressKey !== progressStorageKey(marker.userId, marker.gameId)) return false;
      if (!Number.isSafeInteger(marker.createdAt) || marker.createdAt <= 0) {
        marker.createdAt = Date.now();
        storage.setItem(markerKey, JSON.stringify(marker));
      }
      if (
        marker.createdAt > Date.now() + 5 * 60 * 1000 ||
        Date.now() - marker.createdAt > MAX_PENDING_COMPLETION_AGE_MS
      ) {
        storage.removeItem(markerKey);
        return true;
      }
      const rawSnapshot = storage.getItem(marker.progressKey);
      if (rawSnapshot) {
        snapshot = normalizeSnapshot(JSON.parse(rawSnapshot));
        if (snapshot === null) return false;
      } else {
        snapshot = null;
      }
    } catch {
      return false;
    }

    const clearMarker = () => {
      try { storage.removeItem(markerKey); } catch { /* No future load should retry a terminal response. */ }
    };
    const shouldRetry = (response: Response) => response.status >= 500;

    try {
      if (snapshot) {
        const syncResponse = await fetcher("/api/progress/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: marker.gameId, ...toServerPayload(snapshot) }),
        });
        if (!syncResponse.ok) {
          if (shouldRetry(syncResponse)) return false;
          clearMarker();
          return true;
        }
      }

      // A retry that succeeds only after IST midnight will save the game but
      // intentionally will not count it toward the now-expired daily streak.
      const completionResponse = await fetcher("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: marker.gameId }),
      });
      if (!completionResponse.ok) {
        if (shouldRetry(completionResponse)) return false;
        clearMarker();
        return true;
      }

      try { storage.removeItem(marker.progressKey); } catch { /* Completion is already durable. */ }
      clearMarker();
      return true;
    } catch {
      return false;
    }
  })();

  pendingRetries.set(markerKey, retry);
  void retry.finally(() => pendingRetries.delete(markerKey));
  return retry;
}
