import type { ReactNode } from "react";

export function GameplayCard({ children }: { children: ReactNode }) {
  return (
    <section className="loop-card p-5">
      {children}
    </section>
  );
}
