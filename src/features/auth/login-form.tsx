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
        placeholder="name@example.com"
        autoComplete="email"
      />
      {error && <p className="auth-error" role="alert">{error}</p>}

      <button type="submit" className="auth-primary" disabled={busy}>
        {busy ? "Sending…" : <>Continue with magic link <span aria-hidden="true">→</span></>}
      </button>

      <div className="auth-divider"><span>or</span></div>
      <button type="button" className="auth-secondary auth-google" onClick={handleGoogleSignIn} disabled={busy}>
        <span aria-hidden="true">G</span> Continue with Google
      </button>
    </form>
  );
}
