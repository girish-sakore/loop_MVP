"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import RecentGames from "@/components/matchbox/recent-games";
import CatButton from "@/components/matchbox/cat-button";
import EnablePush from "@/components/pwa/enable-push";
import InstallPrompt from "@/components/pwa/install-prompt";
import type { StreakData } from "@/features/streak/types";
import type { RecentGame } from "@/features/recent-games/types";

export interface ProfileIdentity {
  name: string;
  email: string;
  image?: string | null;
  isPremium: boolean;
  plan: string | null;
  /** ISO date string */
  subscriptionEnd?: string | null;
}

export interface ProfileVillage {
  id: string;
  title: string;
  order: number;
  completed: number;
  total: number;
  locked: boolean;
}

interface ProfileViewProps {
  identity: ProfileIdentity;
  streak: StreakData;
  recentGames: RecentGame[];
  villages: ProfileVillage[];
}

export default function ProfileView({
  identity,
  streak,
  recentGames,
  villages,
}: ProfileViewProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const initials = (identity.name || "L")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const planTag = identity.isPremium ? "PREMIUM+" : "FREE";
  const renews =
    identity.isPremium && identity.subscriptionEnd
      ? ` · renews ${new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(identity.subscriptionEnd))}`
      : "";

  const handleLogout = async () => {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
    setSigningOut(false);
  };

  return (
    <>
      <div className="top">
        <div className="brand">
          <CatButton />
          <div className="banner sm"><h1>PROFILE</h1></div>
        </div>
        <span className="streak">
          <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <path
              d="M7 0c1 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3C5 6 6 3 7 0z"
              style={{ fill: "var(--mb-yel)" }}
            />
          </svg>
          <span><span>{streak.current}</span></span>
        </span>
      </div>

      {/* Identity card */}
      <div className="card paper" style={{ padding: "14px 16px", marginTop: 14 }}>
        <div className="pf-id">
          <div className="pf-av" aria-hidden={!!identity.image}>
            {identity.image ? (
              <Image
                src={identity.image}
                alt=""
                width={72}
                height={72}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="pf-who">
            <h1>{identity.name || "Stranger"}</h1>
            <p>{identity.email}</p>
            <span className={`pf-tag ${identity.isPremium ? "" : "free"}`}>
              {planTag}
            </span>
          </div>
        </div>
        <div className="mono lt2" style={{ marginTop: 10, color: "var(--mb-ink)", opacity: 0.6 }}>
          {renews}
        </div>
      </div>

      <div className="card paper" style={{ padding: "14px 16px", marginTop: 12 }}>
        <div className="sech" style={{ marginTop: 0 }}>Your app</div>
        <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
          <InstallPrompt />
          <EnablePush />
        </div>
      </div>

      {!identity.isPremium && (
        <div
          className="card paper"
          style={{
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <b style={{ fontSize: 15 }}>Unlock every past box</b>
          <Link
            href="/pricing"
            className="chip on link"
            style={{
              ["--c" as string]: "var(--mb-t1)",
              ["--f" as string]: "var(--mb-tf1)",
              textDecoration: "none",
            }}
          >
            Unlock
          </Link>
        </div>
      )}

      <RecentGames games={recentGames} />

      <div className="sech">Villages</div>
      <div className="glist mb-4">
        {villages.map((v) => {
          const allDone = v.total > 0 && v.completed === v.total;
          const pct = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0;
          return (
            <div key={v.id} className="gr static" style={v.locked ? { opacity: 0.55 } : undefined}>
              <span className="gb" style={{ ["--c" as string]: "var(--mb-t3)", ["--f" as string]: "var(--mb-tf3)" }}>
                {String(v.order).padStart(3, "0")}
              </span>
              <span className="gm">
                <b>{v.title}</b>
                <small>
                  {v.locked
                    ? "Locked — clear the last village"
                    : allDone
                      ? "All games struck"
                      : `${v.completed} of ${v.total} games struck`}
                </small>
              </span>
              {v.locked ? (
                <span className="material-symbols-outlined" style={{ fontSize: 20, opacity: 0.5 }} aria-hidden="true">
                  lock
                </span>
              ) : allDone ? (
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--mb-green)" }} aria-hidden="true">
                  check
                </span>
              ) : (
                <span className="gs" aria-hidden="true">
                  <span
                    style={{
                      writingMode: "vertical-rl" as const,
                      transform: "rotate(180deg)",
                      background: "var(--mb-t3)",
                      color: "var(--mb-tf3)",
                      border: "2px solid var(--mb-ink)",
                      borderRadius: 99,
                      padding: "6px 3px",
                      font: "700 9px var(--font-dm), system-ui, sans-serif",
                    }}
                  >
                    {pct}%
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button className="go pf-out" onClick={handleLogout} disabled={signingOut}>
        {signingOut ? "Logging out…" : "Log out"}
      </button>

      <p className="pf-ver">Loop · v2.4.1 (Stable)</p>
    </>
  );
}
