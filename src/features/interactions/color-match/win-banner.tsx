"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  show: boolean;
};

export function WinBanner({ show }: Props) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed left-1/2 top-24 z-[150] w-max max-w-[92vw] -translate-x-1/2 rounded-full border-[3px] border-[#0b0b0f] bg-[#0b0b0f] px-5 py-3 text-center text-[14px] font-extrabold leading-tight text-[#f6f2ec] shadow-[0_7px_0_rgba(11,11,15,0.3)]"
          initial={{ y: -140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -140, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          You matched them all — nice eye! 🎉
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
