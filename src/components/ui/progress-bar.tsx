interface ProgressBarProps {
  label: string;
  progress: string;
  color: string;
  percent: string;
}

export function ProgressBar({ label, progress, color, percent }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[12px] font-extrabold uppercase">
        <span>{label}</span>
        <span className="opacity-70">{percent}</span>
      </div>
      <div className="relative h-6 w-full overflow-hidden rounded-full border-[3px] border-[#0b0b0f] bg-[#fffdf7]">
        <div className={`h-full ${color} ${progress} relative border-r-[3px] border-[#0b0b0f]`}>
          <div className="absolute inset-0 progress-shine"></div>
        </div>
      </div>
    </div>
  );
}
