"use client";

import Link from "next/link";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";

interface PricingFooterProps {
  plan: "monthly" | "yearly";
  userEmail?: string;
  userName?: string;
}

const PRICE = {
  monthly: { amount: "₹99", period: "month", renews: "monthly" },
  yearly: { amount: "₹699", period: "year", renews: "yearly" },
} as const;

export function PricingFooter({ plan, userEmail, userName }: PricingFooterProps) {
  const { startCheckout, state, error } = useRazorpayCheckout({
    plan,
    userEmail,
    userName,
    onSuccess: () => {
      // router.refresh() already called inside hook
    },
  });

  const busy = state === "creating_order" || state === "verifying";
  const success = state === "success";
  const price = PRICE[plan];

  const buttonLabel = {
    idle: `Start Premium · ${price.amount} / ${price.period}`,
    creating_order: "Preparing…",
    waiting_payment: "Complete payment…",
    verifying: "Confirming…",
    success: "You're in",
    error: "Try again",
  }[state];

  return (
    <section className="p-checkout">
      <div className="p-summary">
        <span>
          <b>Loop Premium · {price.amount} / {price.period}</b>
          <br />
          Renews {price.renews}. Cancel anytime.
        </span>
      </div>

      {userEmail && (
        <p className="p-foot">Signed in as {userEmail}</p>
      )}

      {success && (
        <div className="p-msg p-msg--ok" role="status">
          You&apos;re in. Every game and the full archive are unlocked.
        </div>
      )}

      {error && (
        <div className="p-msg p-msg--err" role="alert">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={startCheckout}
        disabled={busy || success}
        className="l-btn l-btn--primary p-cta"
      >
        {buttonLabel}
      </button>

      <p className="p-reassure">
        Secure payment via Razorpay. Renews automatically until you cancel.
      </p>

      <div className="p-foot">
        <nav aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
      </div>
    </section>
  );
}