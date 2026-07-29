"use client";

import type { MapNode } from "@/features/map/types";

export function MapNodeMarker({
  node,
  onTap,
}: {
  node: MapNode;
  onTap: (node: MapNode) => void;
}) {
  const isTappable = node.status === "current";

  return (
    <button
      disabled={!isTappable}
      onClick={() => isTappable && onTap(node)}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
        width: 44,
        height: 33,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        backgroundColor:
          node.status === "completed"
            ? "var(--primary)"
            : node.status === "current"
              ? "var(--secondary)"
              : "var(--surface-variant)",
        color: "var(--on-primary)",
        boxShadow: isTappable
          ? "0 7px 0 0 #2a4d41"
          : "0 7px 0 0 #c6c7c0",
        opacity: node.status === "locked" ? 0.4 : 1,
      }}
    >
      {node.status === "completed" && "★"}
      {node.status === "current" && node.stageIndex + 1}
      {(node.status === "upcoming" || node.status === "locked") && "?"}
    </button>
  );
}