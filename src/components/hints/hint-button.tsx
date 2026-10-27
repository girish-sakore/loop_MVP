import type { GroupApi } from "@/features/gameplay/hints/types";

export function HintButton({ group, onOpen, disabled, className }: { group?: GroupApi; onOpen: () => void; disabled?: boolean; className?: string }) {
  if (!group?.exists) return null;
  const dead = disabled || (!group.canReveal && group.usedCount === 0);
  return <button type="button" onClick={onOpen} disabled={dead} className={className ?? "relative h-12 w-[64px] shrink-0 rounded-full border-[3px] border-[#2B2A25] bg-[#FFFDF7] text-[15px] font-extrabold text-[#2B2A25] shadow-[0_4px_0_#2B2A25] transition active:scale-95 disabled:opacity-50"}>
    Hint
    {group.remaining > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2B2A25] bg-[#E8933A] text-[10px] font-extrabold text-white">{group.remaining}</span>}
  </button>;
}
