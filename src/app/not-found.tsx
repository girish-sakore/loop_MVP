import Link from "next/link";
import { MobileContainer } from "@/components/layout/mobile-container";

export default function NotFound() {
  return (
    <MobileContainer>
      <div
        className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-8"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--surface-container-low)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 48,
              color: "var(--on-surface-variant)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            search_off
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[32px] font-extrabold leading-tight"
            style={{ color: "var(--on-surface)" }}
          >
            Page not found
          </h1>
          <p
            className="text-[16px] leading-relaxed"
            style={{ color: "var(--on-surface-variant)" }}
          >
            This page doesn't exist or was moved.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/edition/current"
          className="h-14 px-8 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--on-secondary)",
            boxShadow: "0 4px 0 0 #2a4d41",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            home
          </span>
          Back to Home
        </Link>
      </div>
    </MobileContainer>
  );
}