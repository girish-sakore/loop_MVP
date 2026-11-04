"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { StreakData } from "@/features/streak/types";

export interface ProfileIdentity {
  name: string;
  email: string;
  image?: string | null;
  isPremium: boolean;
  plan: string | null;
  /** ISO date string */
  subscriptionEnd?: string | null;
}

interface ProfileViewProps {
  identity: ProfileIdentity;
  streak: StreakData;
  editionsCompleted: number;
}

export default function ProfileView({
  identity,
  streak,
  editionsCompleted,
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
  const progress = streak.goal > 0 ? Math.min(100, (streak.current / streak.goal) * 100) : 0;
  const remaining = Math.max(0, streak.goal - streak.current);

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
      <header className="profile-heading"><h1>Profile</h1></header>

      <section className="profile-identity">
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
      </section>

      {!identity.isPremium && (
        <div className="premium-promo">
          <b>Unlock every past edition</b>
          <Link href="/pricing" className="premium-promo-action">Go Premium</Link>
        </div>
      )}

      <section className="profile-stats" aria-label="Your stats">
        <div><b>{streak.current}</b><span>Day streak</span></div>
        <div><b>{streak.best}</b><span>Best streak</span></div>
        <div><b>{streak.stats.accuracyPct}%</b><span>Answers right</span></div>
      </section>

      <div className="profile-section-title">Next milestone</div>
      <section className="profile-milestone">
        <div><b>{streak.goal}-day badge</b><strong>{streak.current} / {streak.goal}</strong></div>
        <div className="profile-milestone-progress" role="progressbar" aria-label="Progress to next badge" aria-valuemin={0} aria-valuemax={streak.goal} aria-valuenow={Math.min(streak.current, streak.goal)}><i style={{ width: `${progress}%` }} /></div>
        <p>{remaining === 0 ? "Milestone reached — keep your streak going." : `${remaining} days to go. Finish each edition to keep your streak.`}</p>
      </section>

      <div className="profile-section-title">Account</div>
      <section className="profile-account">
        <div><b>Plan</b><span>{identity.isPremium ? "Premium" : "Free"}</span></div>
        <div><b>Editions completed</b><span>{editionsCompleted}</span></div>
      </section>

      <button className="profile-logout" onClick={handleLogout} disabled={signingOut}>
        {signingOut ? "Logging out…" : "Log out"}
      </button>
    </>
  );
}
