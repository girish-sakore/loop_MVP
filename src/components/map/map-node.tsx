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
        width: 60,
        height: 50,
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
          : node.status === "completed"
            ? "0 8px 0 0 var(--current-shadow)"
            : node.status === "current"
              ? "0 8px 0 0 var(--secondary-fixed-dim)"
              : "0 8px 0 0 var(--on-tertiary-fixed-variant)",
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
      {node.status === "current" && node.nodeIndex + 1}
      {(node.status === "upcoming" || node.status === "locked") && "?"}
    </button>
  );
}