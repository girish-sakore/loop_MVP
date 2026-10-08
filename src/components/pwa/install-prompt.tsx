"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const updateInstalled = () => {
      const isStandalone = standaloneQuery.matches ||
        ("standalone" in navigator && navigator.standalone === true);
      setIsInstalled(isStandalone);
    };
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
    setIsIosSafari(ios && safari);
    updateInstalled();
    standaloneQuery.addEventListener("change", updateInstalled);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      standaloneQuery.removeEventListener("change", updateInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (isInstalled) return null;

  return (
    <section aria-label="Install Loopit">
      {installEvent ? (
        <button
          type="button"
          className="chip on"
          style={{ ["--c" as string]: "var(--mb-t2)", ["--f" as string]: "var(--mb-tf2)" }}
          onClick={() => void install()}
        >
          Install app
        </button>
      ) : isIosSafari ? (
        <p style={{ margin: 0, color: "var(--mb-ink)", fontSize: 13 }}>
          Tap Share, then Add to Home Screen.
        </p>
      ) : null}
    </section>
  );
}