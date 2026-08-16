"use client";

import { motion } from "framer-motion";
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
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          width: "93%",
          inset: 0,
          zIndex: 199,
          background: "transparent",
        }}
      />

      {/* Popup */}
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 20,
          zIndex: 200,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F7F1E6",
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 12px 40px rgba(0,0,0,.2)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                color: "#888",
                fontWeight: 700,
              }}
            >
              Current Stop
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {node.title}
            </div>

            <div
              style={{
                color: "#666",
                fontSize: 12,
              }}
            >
              {node.subtitle}
            </div>
          </div>

          <button
            onClick={() => router.push(`/edition/${editionId}/${node.nodeId}`)}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              background: "#3a6757",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            CONTINUE →
          </button>
        </div>
      </motion.div>
    </>
  );
}