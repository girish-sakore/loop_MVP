"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { burst } from "@/lib/matchbox/sparks";
import type { Edition } from "@/types/gameplay";

interface EditionCtaProps {
  edition: Edition;
  status: "not_started" | "in_progress" | "completed";
  currentNode?: number;
}

export function EditionCta({
  edition,
  status,
  currentNode = 0,
}: EditionCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart(e: MouseEvent) {
    burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    setLoading(true);
    try {
      await fetch("/api/progress/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: edition.nodes[0]?.id }),
      });
    } catch {
      // Non-blocking — still navigate even if record fails
    }
    router.push(`/map`);
  }

  const isResume = status === "in_progress";
  const label = loading ? "LOADING…" : isResume ? "RESUME SESSION" : "STRIKE TODAY'S MATCH";
  const sublabel = isResume
    ? `Continue from stage ${currentNode + 1}`
    : "Tap to begin your rhythm";

  return (
    <section className="mb mb-root">
      <button className="go" onClick={handleStart} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
        {label}
      </button>
      <p className="mono lt" style={{ textAlign: "center", color: "var(--mb-onbg)", opacity: 0.7, marginTop: 12, textTransform: "uppercase" }}>
        {sublabel}
      </p>
    </section>
  );
}