import type { GroupApi } from "@/features/gameplay/hints/types";

export function HintSheet({ open, group, title = "Hint", fallbackText, onClose }: { open: boolean; group?: GroupApi; title?: string; fallbackText?: string; onClose: () => void }) {
  if (!open || !group?.exists) return null;
  return <div className="fixed inset-0 z-[80] flex items-end bg-[#0b0b0f]/25 px-4 pb-5" onClick={onClose}>
    <div className="w-full rounded-md border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-4 shadow-[0_6px_0_rgba(11,11,15,0.18)]" onClick={(event) => event.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between"><h2 className="text-[15px] font-extrabold">{title}</h2><button type="button" onClick={onClose} aria-label="Close hint" className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#0b0b0f]"><span className="material-symbols-outlined text-[20px]">close</span></button></div>
      {group.anonymous && fallbackText && <p className="mb-2 text-[15px] font-semibold leading-snug text-[#343238]">{fallbackText}</p>}
      {group.revealed.map((hint) => <p key={hint.id} className="mb-2 text-[15px] font-semibold leading-snug text-[#343238]">{hint.text}</p>)}
      {!group.anonymous && group.canReveal && group.usedCount > 0 && <button type="button" onClick={() => group.reveal()} className="mt-1 h-11 w-full rounded-full border-[3px] border-[#0b0b0f] bg-[#FBAE4B] text-[14px] font-extrabold">Reveal another hint ({group.remaining} left)</button>}
    </div>
  </div>;
}
