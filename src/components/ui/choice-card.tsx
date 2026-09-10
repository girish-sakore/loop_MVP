import type { ReactNode } from "react";

type ChoiceCardProps = {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

export function ChoiceCard({ onClick, disabled, children }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl border-[3px] border-[#0b0b0f] bg-[#fffdf7] p-4 text-left font-extrabold shadow-[0_6px_0_#0b0b0f] transition active:translate-y-1 active:shadow-[0_2px_0_#0b0b0f] disabled:opacity-70"
    >
      {children}
    </button>
  );
}
