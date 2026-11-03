"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // adjust to your actual summary route
  const isSummary = pathname.startsWith("/summary");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }); // swap for your auth's sign-out
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Loop home">
          LOOP<span>.</span>
        </Link>

        {/* <nav className="site-links" aria-label="Marketing">
          <Link href="/#experience">Experience</Link>
          <Link href="/#benefits">Benefits</Link>
        </nav> */}

        {isSummary ? (
          <button type="button" className="site-sign-in" onClick={handleLogout}>
            Sign out
          </button>
        ) : (
          <Link href="/login" className="site-sign-in">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}