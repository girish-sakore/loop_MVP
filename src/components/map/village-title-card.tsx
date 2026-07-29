"use client";

import { cinzel } from "@/lib/fonts";

interface VillageTitleCardProps {
  title: string;
  subtitle: string;
  completed: number;
  total: number;
}

export function VillageTitleCard({
  title,
  subtitle,
  completed,
  total,
}: VillageTitleCardProps) {
  const progress = (completed / total) * 100;

  return (
    <div className="fixed left-6 top-28 z-50 w-[235px] overflow-hidden rounded-2xl border border-[#E6D7B8] bg-[#F9F0DE] shadow-[0_10px_30px_rgba(62,42,18,0.22)]">

      {/* Paper Texture */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url('/images/papaer-effect.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Top Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />

      {/* Decorative Corners */}
      <div className="pointer-events-none absolute inset-0">

        {/* Top Left */}
        <div className="absolute left-3 top-3 h-3.5 w-3.5 rounded-tl-md border-l-2 border-t-2 border-[#D4BE97]" />

        {/* Top Right */}
        <div className="absolute right-3 top-3 h-3.5 w-3.5 rounded-tr-md border-r-2 border-t-2 border-[#D4BE97]" />

        {/* Bottom Left */}
        <div className="absolute bottom-3 left-3 h-3.5 w-3.5 rounded-bl-md border-b-2 border-l-2 border-[#D4BE97]" />

        {/* Bottom Right */}
        <div className="absolute bottom-3 right-3 h-3.5 w-3.5 rounded-br-md border-b-2 border-r-2 border-[#D4BE97]" />

      </div>

      {/* Content */}
      <div className="relative z-10 px-5 py-4">

        {/* Title */}
        <div className="text-center">

          <h2
            className={`${cinzel.className} text-[20px] font-extrabold uppercase leading-none tracking-[0.04em] text-[#20364C] drop-shadow-[0_1px_0_rgba(255,255,255,.3)]`}
          >
            {title}
          </h2>

          <p className="mt-1 text-[14px] font-medium leading-tight text-[#78634F]">
            {subtitle}
          </p>

        </div>

        {/* Divider */}
        <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#D8C19A]/80 to-transparent" />

        {/* Progress */}
        <div className="flex items-center gap-0">

          <span className="min-w-[36px] text-[12px] font-bold text-[#4B3A2A]">
            {completed}/{total}
          </span>

          <div className="h-[14px] flex-1 rounded-full border border-[#CDB995] bg-[#EEE2CC] p-[2px] shadow-inner">

            <div
              className="relative h-full rounded-full bg-gradient-to-r from-[#98CC44] via-[#7DBD34] to-[#639F27] transition-all duration-500"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/25" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}