"use client";

import { useState } from "react";

type Plan = "yearly" | "monthly";

interface PricingPlansProps {
  onPlanChange?: (plan: Plan) => void;
}

export function PricingPlans({ onPlanChange }: PricingPlansProps) {
  const [selected, setSelected] = useState<Plan>("yearly");

  function handleSelect(plan: Plan) {
    setSelected(plan);
    onPlanChange?.(plan);
  }

  return (
    <section className="flex flex-col gap-3">
      {/* Yearly */}
      <button
        onClick={() => handleSelect("yearly")}
        className="w-full flex items-center justify-between p-6 rounded-xl text-left transition-all duration-150 active:scale-[0.98]"
        style={{
          backgroundColor:
            selected === "yearly"
              ? "var(--secondary-container)"
              : "var(--surface-container)",
          border:
            selected === "yearly"
              ? "2px solid var(--secondary)"
              : "2px solid transparent",
          boxShadow:
            selected === "yearly"
              ? "0 4px 16px rgba(58,103,87,0.12)"
              : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[18px] font-bold"
              style={{ color: "var(--on-secondary-container)" }}
            >
              Yearly Membership
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
              }}
            >
              SAVE 40%
            </span>
          </div>
          <p
            className="text-sm"
            style={{
              color:
                "color-mix(in srgb, var(--on-secondary-container) 80%, transparent)",
            }}
          >
            Billed annually at ₹699/yr
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span
            className="text-[28px] font-extrabold leading-none block"
            style={{ color: "var(--secondary)" }}
          >
            ₹60
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--on-secondary-container)" }}
          >
            per month
          </span>
        </div>
      </button>

      {/* Monthly */}
      <button
        onClick={() => handleSelect("monthly")}
        className="w-full flex items-center justify-between p-6 rounded-xl text-left transition-all duration-150 active:scale-[0.98]"
        style={{
          backgroundColor:
            selected === "monthly"
              ? "var(--secondary-container)"
              : "var(--surface-container)",
          border:
            selected === "monthly"
              ? "2px solid var(--secondary)"
              : "2px solid transparent",
          boxShadow:
            selected === "monthly"
              ? "0 4px 16px rgba(58,103,87,0.12)"
              : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex flex-col gap-1">
          <span
            className="text-[18px] font-bold"
            style={{ color: "var(--on-surface)" }}
          >
            Monthly Pass
          </span>
          <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
            Flexible, cancel anytime
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span
            className="text-[28px] font-extrabold leading-none block"
            style={{ color: "var(--on-surface)" }}
          >
            ₹99
          </span>
          <span className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
            per month
          </span>
        </div>
      </button>
    </section>
  );
}