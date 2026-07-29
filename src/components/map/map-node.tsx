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
          ? "0 7px 0 0 var(--secondary-shadow)"
          : node.status === "current"
            ? "0 7px 0 0 var(--secondary-shadow)"
            : "0 7px 0 0 var(--background-shadow)",
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