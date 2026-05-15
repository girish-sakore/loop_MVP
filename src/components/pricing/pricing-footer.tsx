"use client";

import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";

interface PricingFooterProps {
  plan: "monthly" | "yearly";
  userEmail?: string;
  userName?: string;
}

export function PricingFooter({ plan, userEmail, userName }: PricingFooterProps) {
  const { startCheckout, state, error } = useRazorpayCheckout({
    plan,
    userEmail,
    userName,
    onSuccess: () => {
      // router.refresh() already called inside hook
      // optionally navigate to a success page
    },
  });

  const busy = state === "creating_order" || state === "verifying";
  const success = state === "success";

  const buttonLabel = {
    idle: "Subscribe Now",
    creating_order: "Preparing…",
    waiting_payment: "Complete Payment…",
    verifying: "Confirming…",
    success: "You're Premium!",
    error: "Try Again",
  }[state];

  return (
    <section className="flex flex-col gap-4 text-center">
      {/* Success state */}
      {success && (
        <div
          className="flex items-center justify-center gap-2 p-4 rounded-xl"
          style={{ backgroundColor: "var(--secondary-container)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              color: "var(--secondary)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            check_circle
          </span>
          <p
            className="text-[15px] font-bold"
            style={{ color: "var(--on-secondary-container)" }}
          >
            Welcome to Premium! Enjoy full access.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{ backgroundColor: "var(--error-container)" }}
        >
          <span
            className="material-symbols-outlined shrink-0"
            style={{ fontSize: 18, color: "var(--error)" }}
          >
            error
          </span>
          <p
            className="text-sm font-medium text-left"
            style={{ color: "var(--on-error-container)" }}
          >
            {error}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={startCheckout}
        disabled={busy || success}
        className="w-full h-14 rounded-xl text-[18px] font-bold transition-all duration-75 active:translate-y-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: success
            ? "var(--secondary-container)"
            : "var(--secondary)",
          color: success ? "var(--on-secondary-container)" : "var(--secondary-foreground)",
          boxShadow: busy || success ? "none" : "0 4px 0 0 #224f40",
        }}
      >
        {busy && (
          <span
            className="material-symbols-outlined animate-spin"
            style={{ fontSize: 20 }}
          >
            progress_activity
          </span>
        )}
        {success && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
          >
            workspace_premium
          </span>
        )}
        {buttonLabel}
      </button>

      {/* Legal links */}
      <div className="flex justify-center gap-6 pt-2 flex-wrap">
        {["Restore Purchase", "Terms of Use", "Privacy Policy"].map((label) => (
          <button
            key={label}
            className="text-[10px] font-bold tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--on-surface-variant)" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p
        className="text-xs leading-relaxed px-4"
        style={{ color: "var(--outline)" }}
      >
        Your subscription renews automatically unless cancelled at least 24
        hours before the renewal date. Manage in Account Settings.
      </p>
    </section>
  );
}