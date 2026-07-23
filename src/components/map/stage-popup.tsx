"use client";

import { useRouter } from "next/navigation";
import type { MapNode } from "@/features/map/types";

export function StagePopup({
  node,
  editionId,
  onClose,
}: {
  node: MapNode;
  editionId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div style={{ position: "absolute", left: node.x, top: node.y, transform: "translate(-50%, -110%)" }}>
      <div style={{ backgroundColor: "var(--surface)", borderRadius: 12, padding: 12 }}>
        <p style={{ color: "var(--on-surface)" }}>Stage {node.stageIndex + 1}</p>
        <button
          onClick={() => router.push(`/edition/${editionId}`)}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--on-primary)",
            boxShadow: "0 4px 0 0 #2a4d41",
            borderRadius: 8,
            padding: "8px 20px",
          }}
        >
          PLAY
        </button>
        <button onClick={onClose}>×</button>
      </div>
    </div>
  );
}