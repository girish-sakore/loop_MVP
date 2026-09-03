"use client";

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
    <div className="loop-card absolute left-5 top-8 z-50 w-[255px] overflow-hidden p-5">
      <div className="relative z-10">
        <div className="text-center">

          <h2 className="font-display text-[30px] leading-none text-[#0b0b0f]">
            {title}
          </h2>

          <p className="mt-2 text-[14px] font-extrabold leading-tight text-[#343238]">
            {subtitle}
          </p>

        </div>

        <div className="my-4 h-[3px] bg-[#0b0b0f]" />

        <div className="flex items-center gap-2">

          <span className="min-w-[42px] text-[13px] font-extrabold text-[#0b0b0f]">
            {completed}/{total}
          </span>

          <div className="h-[18px] flex-1 overflow-hidden rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7]">

            <div
              className="relative h-full bg-[#85cb57] transition-all duration-500"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
