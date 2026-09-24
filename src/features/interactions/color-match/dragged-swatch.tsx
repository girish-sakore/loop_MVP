"use client";

import { motion } from "framer-motion";
import type { DragState, FloatLabel } from "./use-color-match-game";

type Props = {
  dragging: DragState | null;
  label: FloatLabel;
};

export function DraggedSwatch({ dragging, label }: Props) {
  if (!dragging) return null;

  const tray = document.querySelector("[data-swatch-tray]");
  const trayRect = tray?.getBoundingClientRect();

  // Start fading the label once the swatch moves 30px above the tray.
  const fadeStart = (trayRect?.top ?? window.innerHeight) - 0;

  const distanceAboveTray = Math.max(0, fadeStart - dragging.y);

  // Fade out over the next 60px of movement.
  const labelOpacity = Math.max(
    0,
    Math.min(1, 1 - distanceAboveTray / 60)
  );

  return (
    <>
      <div
        className="pointer-events-none fixed z-[200] rounded-full border-[3px] border-[#0b0b0f]"
        style={{
          left: dragging.x,
          top: dragging.y,
          width: dragging.w,
          height: dragging.h,
          background: dragging.hex,
          transform: "scale(1.25)",
          boxShadow:
            "inset 0 0 0 3px rgba(255,255,255,0.35), 0 10px 24px rgba(11,11,15,0.35)",
        }}
      />

      {label ? (
        <div
          className="pointer-events-none fixed z-[201]"
          style={{
            left: label.x,
            top: label.y,
            opacity: labelOpacity,
            transform: "translate(-50%, -65px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: labelOpacity, y: 0, scale: 1 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            className="whitespace-nowrap rounded-full border-[3px] border-[#0b0b0f] bg-[#0b0b0f] px-3 py-1.5 text-[17px] font-extrabold leading-none text-[#f6f2ec] shadow-[0_5px_0_rgba(11,11,15,0.3)]"
          >
            {label.text}
          </motion.div>
        </div>
      ) : null}
    </>
  );
}