"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/map", icon: "today", label: "Today" },
    { href: "/library", icon: "view_carousel", label: "Library" },
    { href: "/profile", icon: "schedule", label: "Profile" },
  ];

  return (
    <>
      <nav className="fixed bottom-5 left-1/2 z-50 grid w-[min(290px,calc(100%-48px))] max-w-[520px] -translate-x-1/2 grid-cols-3 rounded-full bg-[#efe8dc] p-1.5 shadow-[0_2px_10px_rgba(11,11,15,0.06)]">
        {links.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "flex h-14 flex-col items-center justify-center rounded-full bg-[#ded1b8] text-[#0b0b0f] transition-all duration-75 active:translate-y-0.5"
                  : "flex h-14 flex-col items-center justify-center rounded-full text-[#0b0b0f] transition-all duration-75 hover:bg-[#f5f0e9] active:translate-y-0.5"
              }
            >
              <span
                className="material-symbols-outlined mb-0.5 text-[22px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="text-[12px] font-bold leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
