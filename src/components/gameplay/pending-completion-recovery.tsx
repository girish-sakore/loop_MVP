"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  listPendingCompletions,
  pruneExpiredPendingCompletions,
  retryPendingCompletion,
} from "@/features/gameplay/progress/pending-completions";

export function PendingCompletionRecovery() {
  useEffect(() => {
    let stopped = false;
    let running = false;
    let delay = 1_000;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (wait: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void recover(), wait);
    };

    const recover = async () => {
      if (stopped || running) return;
      pruneExpiredPendingCompletions(localStorage);
      const pending = listPendingCompletions(localStorage);
      if (pending.length === 0) return;

      running = true;
      try {
        const { data } = await authClient.getSession();
        const userId = data?.user?.id;
        if (userId) {
          for (const item of pending) {
            if (item.value.userId === userId) {
              await retryPendingCompletion(item.key);
            }
          }
        }
      } catch {
        // Keep markers for a later connectivity, focus, or timer retry.
      } finally {
        running = false;
      }

      pruneExpiredPendingCompletions(localStorage);
      if (listPendingCompletions(localStorage).length > 0) {
        delay = Math.min(delay * 2, 60_000);
        schedule(delay);
      } else {
        delay = 1_000;
      }
    };

    const retrySoon = () => {
      delay = 1_000;
      schedule(0);
    };
    window.addEventListener("online", retrySoon);
    window.addEventListener("loop:pending-completion", retrySoon);
    document.addEventListener("visibilitychange", retrySoon);
    void recover();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", retrySoon);
      window.removeEventListener("loop:pending-completion", retrySoon);
      document.removeEventListener("visibilitychange", retrySoon);
    };
  }, []);

  return null;
}
