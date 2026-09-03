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
        className="fixed inset-0 z-[199] bg-[#0b0b0f]/10"
      />

      {/* Popup */}
      <motion.div
        initial={{ y: 112, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 112, opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.28,
          ease: [0.2, 0.9, 0.2, 1],
        }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-5 left-4 right-4 z-[200]"
      >
        <div className="relative mx-auto max-w-[480px] overflow-hidden rounded-md border-[4px] border-[#0b0b0f] bg-[#fffdf7] p-3 shadow-[0_10px_0_#0b0b0f]">
          <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full border-[4px] border-[#0b0b0f] bg-[#f7d91f]" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[4px] border-[#0b0b0f] bg-[#f7d91f] text-[24px] font-black shadow-[0_5px_0_#0b0b0f]">
              {node.nodeIndex + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#85cb57]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#343238]">
                  Current Stop
                </span>
              </div>

              <h2 className="truncate text-[19px] font-extrabold leading-tight text-[#0b0b0f]">
                {node.title}
              </h2>

              <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-[#343238]">
                {node.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/edition/${editionId}/${node.nodeId}`)}
              className="flex h-12 shrink-0 items-center gap-1.5 rounded-md border-[3px] border-[#0b0b0f] bg-[#85cb57] px-4 text-[12px] font-extrabold uppercase text-[#0b0b0f] shadow-[0_5px_0_#0b0b0f] transition active:translate-y-1 active:shadow-[0_1px_0_#0b0b0f]"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
