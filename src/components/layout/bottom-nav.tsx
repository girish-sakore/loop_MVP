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
      <nav className="fixed bottom-4 left-1/2 z-50 grid w-[min(390px,calc(100%-36px))] max-w-[520px] -translate-x-1/2 grid-cols-3 rounded-full border-[3px] border-[#1e1b18] bg-[#f8f1e3] p-1.5 shadow-[0_6px_0_#1e1b18]">
        {links.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "flex h-16 flex-col items-center justify-center rounded-full bg-[#1e1b18] text-[#f8f1e3] transition-all duration-75 active:translate-y-0.5"
                  : "flex h-16 flex-col items-center justify-center rounded-full text-[#1e1b18] transition-all duration-75 hover:bg-[#eee3d2] active:translate-y-0.5"
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
