"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type CheckoutState =
  | "idle"
  | "creating_order"
  | "waiting_payment"
  | "verifying"
  | "success"
  | "error";

type UseRazorpayCheckoutOptions = {
  plan: "monthly" | "yearly";
  userEmail?: string;
  userName?: string;
  onSuccess?: () => void;
};

export function useRazorpayCheckout({
  plan,
  userEmail,
  userName,
  onSuccess,
}: UseRazorpayCheckoutOptions) {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setError(null);
    setState("creating_order");

    try {
      // Step 1 — create Razorpay order on server
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error ?? "Could not create order.");
      }

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // Step 2 — load Razorpay script if not already present
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to load. Check your connection.");
      }

      // Step 3 — open Razorpay checkout
      setState("waiting_payment");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: keyId,
          amount: String(amount),
          currency,
          name: "Habitly",
          description:
            plan === "yearly" ? "Yearly Membership" : "Monthly Pass",
          order_id: orderId,
          prefill: {
            email: userEmail ?? "",
            name: userName ?? "",
          },
          theme: { color: "#3a6757" },
          modal: {
            ondismiss: () => {
              setState("idle");
              reject(new Error("dismissed"));
            },
          },
          handler: async (response) => {
            // Step 4 — verify on server
            setState("verifying");
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                const data = await verifyRes.json();
                throw new Error(data.error ?? "Verification failed.");
              }

              setState("success");
              onSuccess?.();
              // Refresh server session so isPremium is updated everywhere
              router.refresh();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });

        rzp.on("payment.failed", (res) => {
          reject(
            new Error(
              res.error?.description ?? "Payment failed. Please try again.",
            ),
          );
        });

        rzp.open();
      });
    } catch (err) {
      if (err instanceof Error && err.message === "dismissed") return;
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setState("error");
    }
  }, [plan, userEmail, userName, onSuccess, router]);

  return { startCheckout, state, error };
}

// Lazily load the Razorpay checkout script once
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script."));
    document.body.appendChild(script);
  });
}