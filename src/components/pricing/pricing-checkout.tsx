"use client";

import { useState } from "react";
import { PricingPlans } from "./pricing-plans";
import { PricingFooter } from "./pricing-footer";

interface PricingCheckoutProps {
  userEmail?: string;
  userName?: string;
}

export function PricingCheckout({ userEmail, userName }: PricingCheckoutProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  return (
    <>
      <PricingPlans onPlanChange={setPlan} />
      <PricingFooter plan={plan} userEmail={userEmail} userName={userName} />
    </>
  );
}