// src/components/map/map-nav-toggle.tsx
"use client";

import { useUiStore } from "@/stores/ui-store";

export function MapNavToggle() {
  const isVisible = useUiStore((s) => s.isMapNavVisible);
  const toggle = useUiStore((s) => s.toggleMapNav);

  return (
    <button
      onClick={toggle}
      aria-label={isVisible ? "Hide navigation" : "Show navigation"}
      style={{
        position: "fixed",
        bottom: 96,
        right: 16,
        zIndex: 60,
        width: 48,
        height: 48,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--secondary-container)",
        color: "var(--on-secondary-container)",
        boxShadow: "0 4px 0 0 #3a6757",
      }}
    >
      <span className="material-symbols-outlined">
        {isVisible ? "keyboard_arrow_down" : "keyboard_arrow_up"}
      </span>
    </button>
  );
}