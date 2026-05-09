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
  const callbackUrl = searchParams.get("callbackUrl") ?? "/edition/current";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.magicLink({
        email: trimmed,
        callbackURL: callbackUrl,
      });
      if (signInError) {
        setError("Could not send your magic link.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not send your magic link.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Check your email</p>
        <p>Your sign-in link is ready. Open it on this device to continue.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none"
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
      >
        {busy ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
