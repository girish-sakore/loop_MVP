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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email to continue.");
      return;
    }

    setBusy(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.magicLink({ email: trimmed, callbackURL: callbackUrl });
    if (signInError) {
      setError(signInError.message || "Could not send link.");
    } else {
      setSubmitted(true);
    }
    setBusy(false);
  }

  async function handleResend() {
    if (resendCooldown) return;
    setResendCooldown(true);
    await authClient.signIn.magicLink({ email: email.trim(), callbackURL: callbackUrl });
    setTimeout(() => setResendCooldown(false), 30_000);
  }

  async function handleGoogleSignIn() {
    setBusy(true);
    setError(null);
    const { error: signInError } = await authClient.signIn.social({ provider: "google", callbackURL: callbackUrl });
    if (signInError) {
      setError(signInError.message || "Could not sign in with Google.");
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <section className="auth-success" aria-live="polite">
        <span className="auth-mail-icon material-symbols-outlined" aria-hidden="true">mark_email_unread</span>
        <p className="auth-kicker">Check your inbox</p>
        <h1>Magic link sent</h1>
        <p>We&apos;ve sent a sign-in link to <strong>{email}</strong>. It expires in 10 minutes.</p>
        <button type="button" className="auth-primary" onClick={() => { window.location.href = "mailto:"; }}>
          Open email app <span aria-hidden="true">→</span>
        </button>
        <div className="auth-success-actions">
          <button type="button" className="auth-secondary" onClick={handleResend} disabled={resendCooldown}>
            {resendCooldown ? "Link sent" : "Resend link"}
          </button>
          <button type="button" className="auth-secondary" onClick={() => { setSubmitted(false); setError(null); }}>
            Change email
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-form-intro">
        <p className="auth-kicker">Member sign in</p>
        <h1>Welcome</h1>
        <p>Sign in to pick up your next edition.</p>
      </div>

      <label className="auth-label" htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="username@email.com"
        autoComplete="email"
      />
      {error && <p className="auth-error" role="alert">{error}</p>}

      <button type="submit" className="auth-primary" disabled={busy}>
        {busy ? "Sending…" : <>Continue with magic link <span aria-hidden="true">→</span></>}
      </button>

      <div className="auth-divider"><span>or</span></div>
      <button type="button" className="auth-secondary auth-google" onClick={handleGoogleSignIn} disabled={busy}>
        <span aria-hidden="true">
          <svg
            viewBox="-3 0 262 262"
            width="18"
            height="18"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451" fill="#4285F4">

              </path>
              <path d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1" fill="#34A853">

              </path>
              <path d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37" fill="#FBBC05">

              </path>
              <path d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479" fill="#EB4335">

              </path>
            </g>
          </svg>
        </span> Continue with Google
      </button>
    </form>
  );
}
