interface ProgressBarProps {
  label: string;
  progress: string;
  color: string;
  percent: string;
}

export function ProgressBar({ label, progress, color, percent }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[12px] font-bold tracking-widest">
        <span>{label}</span>
        <span className="opacity-70">{percent}</span>
      </div>
      <div className="h-4 w-full bg-[#f1edec] rounded-full overflow-hidden relative">
        <div className={`h-full ${color} rounded-full ${progress} relative`}>
          <div className="absolute inset-0 progress-shine"></div>
        </div>
      </div>
    </div>
  );
}