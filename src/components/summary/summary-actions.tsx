"use client";

import { useRouter } from "next/navigation";

export function SummaryActions() {
  const router = useRouter();

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Habitly",
        text: "I just completed a session on Habitly!",
        url: window.location.origin,
      });
    }
  }

  return (
    <section className="flex flex-col gap-3 pt-2">
      <button
        onClick={handleShare}
        className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--on-secondary)",
          boxShadow: "0 4px 0 0 #2a4d41",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          share
        </span>
        Share Your Result
      </button>
      <button
        onClick={() => router.push("/edition/current")}
        className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
        style={{
          backgroundColor: "var(--surface-container-high)",
          color: "var(--on-surface)",
          boxShadow: "0 4px 0 0 var(--surface-variant)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          home
        </span>
        Return to Hub
      </button>
    </section>
  );
}