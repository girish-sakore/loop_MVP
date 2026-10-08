"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type PushState =
  | "checking"
  | "unsupported"
  | "ready"
  | "already-subscribed"
  | "permission-denied"
  | "loading"
  | "success"
  | "error";

function base64UrlToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return bytes;
}

function isPushSupported(): boolean {
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true);

  return (
    (!isIos || isStandalone) &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export default function EnablePush() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [state, setState] = useState<PushState>("checking");
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    const inspectSubscription = async () => {
      if (isSessionPending || !session?.user) return;

      if (!isPushSupported()) {
        if (!cancelled) setState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setState("permission-denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const currentSubscription = await registration.pushManager.getSubscription();

        if (!cancelled) {
          setSubscription(currentSubscription);
          setState(currentSubscription ? "already-subscribed" : "ready");
        }
      } catch {
        if (!cancelled) {
          setMessage("Could not prepare reminders on this device. Please try again.");
          setState("error");
        }
      }
    };

    void inspectSubscription();
    return () => {
      cancelled = true;
    };
  }, [isSessionPending, session?.user]);

  const enableReminders = useCallback(async () => {
    if (!session?.user) return;

    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const registrationPromise = navigator.serviceWorker.register("/sw.js");
      // Keep the permission prompt directly within this user-initiated click.
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setState(permission === "denied" ? "permission-denied" : "ready");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("Push reminders are not configured yet. Please try again later.");
      }

      await registrationPromise;
      const registration = await navigator.serviceWorker.ready;
      const currentSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSubscription.toJSON()),
      });

      if (!response.ok) {
        await currentSubscription.unsubscribe();
        throw new Error("Could not save your reminder settings. Please try again.");
      }

      setSubscription(currentSubscription);
      setState("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not enable reminders. Please try again.",
      );
      setState("error");
    }
  }, [session?.user]);

  const disableReminders = useCallback(async () => {
    if (!subscription) return;
    setState("loading");
    setMessage("");

    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      const response = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        throw new Error("Reminders were turned off on this device, but could not be removed from the server.");
      }

      setSubscription(null);
      setState("ready");
      setMessage("Reminders disabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not disable reminders.",
      );
      setState("error");
    }
  }, [subscription]);

  if (isSessionPending) {
    return (
      <section aria-label="Push notification reminders">
        <p style={{ margin: "0 0 10px", color: "var(--mb-ink)", fontSize: 13 }}>
          Checking reminder support…
        </p>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section aria-label="Push notification reminders">
        <p style={{ margin: "0 0 10px", color: "var(--mb-ink)", fontSize: 13 }}>
          <Link href="/login">Sign in</Link> to enable reminder notifications.
        </p>
      </section>
    );
  }

  let statusText = "";
  if (state === "checking") statusText = "Checking reminder support…";
  if (state === "unsupported") {
    statusText = "Reminders aren’t supported here. On iPhone, add Loopit to your Home Screen first, then open it there.";
  }
  if (state === "already-subscribed") statusText = "Reminders are enabled on this device.";
  if (state === "permission-denied") {
    statusText = "Notifications are blocked. Change this site’s notification permission in your browser settings to enable reminders.";
  }
  if (state === "loading") statusText = "Updating your reminder settings…";
  if (state === "success") statusText = "Reminders enabled. We’ll help you keep your streak alive.";
  if (state === "error") statusText = message || "Could not update reminders. Please try again.";
  if (state === "ready" && message) statusText = message;

  return (
    <section aria-label="Push notification reminders">
      <p style={{ margin: "0 0 10px", color: "var(--mb-ink)", fontSize: 13 }}>
        {statusText}
      </p>
      {state === "already-subscribed" || state === "success" ? (
        <button
          type="button"
          className="chip"
          onClick={() => void disableReminders()}
        >
          Disable reminders
        </button>
      ) : state === "checking" || state === "unsupported" || state === "permission-denied" ? null : (
        <button
          type="button"
          className="chip on"
          style={{ ["--c" as string]: "var(--mb-t2)", ["--f" as string]: "var(--mb-tf2)" }}
          onClick={() => void enableReminders()}
          disabled={state === "loading"}
        >
          {state === "loading" ? "Please wait…" : "Enable reminders"}
        </button>
      )}
    </section>
  );
}
