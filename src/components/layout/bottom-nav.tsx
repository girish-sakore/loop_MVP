"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/edition/current", icon: "joystick", label: "Play" },
    { href: "/map", icon: "map", label: "Map" },
    { href: "/rankings", icon: "leaderboard", label: "Rankings" },
    { href: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl">
      {links.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className={
              isActive
                ? "flex h-12 w-16 items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl shadow-[0_2px_0_0_#3a6757] active:translate-y-0.5 transition-all duration-75"
                : "flex h-12 w-12 items-center justify-center text-on-surface-variant hover:bg-surface-variant rounded-xl active:translate-y-0.5 transition-all duration-75"
            }
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
