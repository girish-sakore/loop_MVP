import type { ReactNode } from "react";

export function MobileContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[430px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_20px_60px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
}
