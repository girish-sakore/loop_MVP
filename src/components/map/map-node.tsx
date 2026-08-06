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
      className={node.status === "current" ? "map-node current" : "map-node"}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        transform: "translate(-50%, -50%)",
        width: 70,
        height: 60,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        backgroundColor:
          node.status === "completed"
            ? "var(--secondary)"
            : node.status === "current"
              ? "var(--secondary-fixed)"
              : "var(--on-tertiary-container)",
        color: "var(--card)",
        boxShadow: isTappable
          ? "0 8px 0 0 var(--secondary-shadow)"
          : node.status === "current"
            ? "0 8px 0 0 var(--secondary-shadow)"
            : "0 8px 0 0 var(--background-shadow)",
        opacity: node.status === "locked" ? 0.4 : 1,
      }}
    >
      {node.status === "current" && (
        <>
          <span className="ray ray-1" />
          <span className="ray ray-2" />
          <span className="ray ray-3" />
        </>
      )}
      {node.status === "completed" && "★"}
      {node.status === "current" && node.stageIndex + 1}
      {(node.status === "upcoming" || node.status === "locked") && "?"}
    </button>
  );
}