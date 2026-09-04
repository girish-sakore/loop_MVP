"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/map";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.magicLink({
      email: trimmed,
      callbackURL: callbackUrl,
    });
    if (signInError) {
      setError(signInError.message || "Could not send link.");
      setBusy(false);
    } else {
      setSubmitted(true);
      setBusy(false);
    }
  }

  async function handleResend() {
    if (resendCooldown) return;
    setResendCooldown(true);
    await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: callbackUrl,
    });
    setTimeout(() => setResendCooldown(false), 30_000);
  }

  function handleChangeEmail() {
    setSubmitted(false);
    setError(null);
  }

  function handleOpenEmail() {
    // Best-effort: opens default mail app on mobile
    window.location.href = "mailto:";
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-8 w-full">

        {/* Icon cluster */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full opacity-20 scale-150 blur-3xl"
            style={{ backgroundColor: "var(--secondary-container)" }}
          />
          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(58,103,87,0.15)]"
            style={{ backgroundColor: "var(--secondary-container)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 60,
                color: "var(--secondary)",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              send
            </span>
          </div>
          {/* Floating badge */}
          <div
            className="absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg rotate-12"
            style={{
              backgroundColor: "var(--tertiary-container)",
              color: "var(--tertiary)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              mark_email_unread
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-2">
          <h2
            className="text-[28px] font-bold leading-tight"
            style={{ color: "var(--on-surface)" }}
          >
            Magic Link Sent!
          </h2>
          <p style={{ color: "var(--on-surface-variant)" }}>
            We&apos;ve sent a login link to:
          </p>
          {/* Email pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto border"
            style={{
              backgroundColor: "var(--surface-container-low)",
              borderColor: "color-mix(in srgb, var(--outline-variant) 30%, transparent)",
            }}
          >
            <span
              className="text-sm font-bold"
              style={{ color: "var(--secondary)" }}
            >
              {email}
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, color: "var(--secondary)" }}
            >
              verified
            </span>
          </div>
          <p
            className="text-sm max-w-xs mx-auto mt-2"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Click the link in your email to sign in instantly. It expires in
            10 minutes to keep your account safe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 w-full">
          {/* Primary */}
          <button
            onClick={handleOpenEmail}
            className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
            style={{
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              boxShadow: "0 4px 0 0 #224f40",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              open_in_new
            </span>
            Open Email App
          </button>

          {/* Secondary row */}
          <div className="flex flex-col gap-3">
            <p
              className="text-[11px] font-bold tracking-widest uppercase opacity-60"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Didn&apos;t receive it?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleResend}
                disabled={resendCooldown}
                className="h-12 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--surface-container-high)",
                  color: "var(--on-surface-variant)",
                  boxShadow: "0 4px 0 0 #d1cdcc",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  refresh
                </span>
                {resendCooldown ? "Sent!" : "Resend Link"}
              </button>
              <button
                onClick={handleChangeEmail}
                className="h-12 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
                style={{
                  backgroundColor: "var(--surface-container-high)",
                  color: "var(--on-surface-variant)",
                  boxShadow: "0 4px 0 0 #d1cdcc",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  edit
                </span>
                Change Email
              </button>
            </div>
          </div>
        </div>

        {/* Tip card */}
        <div
          className="w-full p-5 rounded-2xl border flex items-start gap-4 text-left"
          style={{
            backgroundColor: "var(--primary-container)",
            borderColor: "color-mix(in srgb, var(--outline-variant) 20%, transparent)",
          }}
        >
          <div
            className="p-3 rounded-xl shrink-0"
            style={{
              backgroundColor: "var(--secondary-fixed)",
              color: "var(--on-secondary-fixed)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              lightbulb
            </span>
          </div>
          <div>
            <h4
              className="text-sm font-bold mb-1"
              style={{ color: "var(--on-surface)" }}
            >
              Quick Tip
            </h4>
            <p
              className="text-xs"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Check your spam folder or wait a few moments if the email
              doesn&apos;t show up right away.
            </p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full">
      
      {/* Headline */}
      <div className="text-center flex flex-col gap-2">
        <h1
          className="text-[32px] font-bold leading-tight"
          style={{ color: "var(--on-surface)" }}
        >
          Welcome back
        </h1>
        <p
          className="text-[18px]"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Sign in to continue your journey
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-[11px] font-bold tracking-widest uppercase px-1"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="h-14 w-full px-4 rounded-xl outline-none transition-all duration-200 text-[16px]"
          style={{
            backgroundColor: "color-mix(in srgb, var(--secondary) 8%, transparent)",
            color: "var(--on-surface)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-container-lowest)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--secondary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor =
              "color-mix(in srgb, var(--secondary) 8%, transparent)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <p className="text-sm font-medium px-1" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-14 w-full rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-foreground)",
          boxShadow: busy ? "none" : "0 4px 0 0 #2a4d41",
        }}
      >
        {busy ? (
          <>
            <span
              className="material-symbols-outlined animate-spin"
              style={{ fontSize: 20 }}
            >
              progress_activity
            </span>
            Sending…
          </>
        ) : (
          <>
            <span
              className="text-white">Continue with Magic Link</span>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
              arrow_forward
            </span>
          </>
        )}
      </button>
    </form>
  );
}