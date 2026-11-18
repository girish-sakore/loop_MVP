"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavbarProps = {
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

const PLAY_HREF = "/map";

const PLAY_PAGES = [
  "/terms-of-service",
  "/privacy-policy",
  // "/login",
  "/pricing",
];

export default function NavbarClient({ user }: NavbarProps) {
  const pathname = usePathname();

  const isLoggedIn = !!user;
  const isLanding = pathname === "/";
  const showPlayButton = PLAY_PAGES.includes(pathname);

  const initials = (
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "U"
  )
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Loop home">
          LOOP<span>.</span>
        </Link>

        <div className="site-header-actions">
          {!isLoggedIn && isLanding && (
            <Link href="/login" className="site-sign-in">
              Sign In
            </Link>
          )}

          {!isLoggedIn && showPlayButton && (
            <Link
              href={PLAY_HREF}
              className="site-sign-in"
            >
              Play Today&apos;s Edition
            </Link>
          )}

          {isLoggedIn && (
            <Link
              href="/profile"
              className="site-avatar"
              aria-label={`Account: ${user?.name || user?.email}`}
              title={user?.name || user?.email || "Account"}
            >
              {initials}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}