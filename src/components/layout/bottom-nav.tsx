"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLibrary, NavProfile, NavToday } from "@/components/matchbox/icons";

const links = [
  { href: "/map", Icon: NavToday, label: "TODAY" },
  { href: "/library", Icon: NavLibrary, label: "LIBRARY" },
  { href: "/profile", Icon: NavProfile, label: "PROFILE" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="mb mb-root">
      <nav className="mb-nav paper" aria-label="Main">
        {links.map(({ href, Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="mb-tab"
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}