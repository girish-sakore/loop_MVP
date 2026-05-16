"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Edition } from "@/types/gameplay";

interface EditionCtaProps {
  edition: Edition;
  status: "not_started" | "in_progress" | "completed";
  currentStage?: number;
}

export function EditionCta({
  edition,
  status,
  currentStage = 0,
}: EditionCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      await fetch("/api/progress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editionId: edition.id }),
      });
    } catch {
      // Non-blocking — still navigate even if record fails
    }
    router.push(`/edition/${edition.id}`);
  }

  const isResume = status === "in_progress";
  const label = isResume ? "Resume Session" : "Start Session";
  const icon = isResume ? "play_circle" : "play_arrow";
  const sublabel = isResume
    ? `Continue from stage ${currentStage + 1}`
    : "Tap to begin your rhythm";

  return (
    <section className="flex flex-col items-center gap-4">
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full rounded-2xl text-[18px] font-bold flex items-center justify-center gap-3 transition-all duration-75 active:translate-y-0.5 disabled:opacity-60"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--on-secondary)",
          boxShadow: loading ? "none" : "0 4px 0 0 #2a4d41",
          padding: "20px 48px",
        }}
      >
        {loading ? (
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: 24 }}
          >
            progress_activity
          </span>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        )}
        {loading ? "Loading…" : label}
      </button>
      <p
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: "var(--on-surface-variant)", opacity: 0.6 }}
      >
        {sublabel}
      </p>
    </section>
  );
}