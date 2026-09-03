import { ProgressBar } from "../ui/progress-bar";

export default function ProgressSection() {
  return (
    <section className="bg-[#f7d91f] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="loop-card p-7 md:p-12">
          <div className="mb-12 text-center">
            <h2 className="font-display text-5xl leading-tight md:text-7xl">
              Each game teaches you as you play
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-[0.8fr_1fr] md:items-center">
            <div className="space-y-4">
              <ProgressBar label="GEOGRAPHY CLUES" progress="w-[85%]" color="bg-[#85cb57]" percent="85%" />
              <ProgressBar label="HISTORY ORDERING" progress="w-[68%]" color="bg-[#c7a3f7]" percent="68%" />
              <ProgressBar label="VISUAL RECALL" progress="w-[92%]" color="bg-[#4aa8ee]" percent="92%" />
            </div>
            <div className="rounded-[28px] border-[4px] border-[#0b0b0f] bg-[#f5f0e9] p-5 shadow-[8px_9px_0_rgba(11,11,15,0.16)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="loop-icon flex h-14 w-14 items-center justify-center rounded-full bg-[#f28ab2]">
                  <span className="material-symbols-outlined text-4xl">psychology</span>
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase">Unlocked insight</p>
                  <h3 className="text-2xl font-extrabold">Potatoes changed global trade.</h3>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-[#343238]">
                Fast rounds build context first, then ask you to use it. The UI feels like a game, but every move is a small lesson.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
