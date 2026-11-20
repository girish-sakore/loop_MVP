"use client";

import { useState } from "react";

type Plan = "yearly" | "monthly";

interface PricingPlansProps {
  onPlanChange?: (plan: Plan) => void;
}

export function PricingPlans({ onPlanChange }: PricingPlansProps) {
  const [selected, setSelected] = useState<Plan>("yearly");

  function choose(plan: Plan) {
    setSelected(plan);
    onPlanChange?.(plan);
  }

  return (
    <div className="p-plans" role="group" aria-label="Billing period">
      <button
        type="button"
        className="p-plan"
        aria-pressed={selected === "yearly"}
        onClick={() => choose("yearly")}
      >
        <span>
          <b>
            Yearly<span className="p-save">SAVE 41%</span>
          </b>
          <small>Billed ₹699 a year</small>
        </span>
        <span className="p-price">
          ₹60
          <span>per month</span>
        </span>
      </button>

      <button
        type="button"
        className="p-plan"
        aria-pressed={selected === "monthly"}
        onClick={() => choose("monthly")}
      >
        <span>
          <b>Monthly</b>
          <small>Flexible, cancel anytime</small>
        </span>
        <span className="p-price">
          ₹99
          <span>per month</span>
        </span>
      </button>
    </div>
  );
}