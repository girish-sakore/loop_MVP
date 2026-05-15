import type { Edition } from "@/types/gameplay";

interface EditionHeroProps {
  edition: Edition;
}

export function EditionHero({ edition }: EditionHeroProps) {
  return (
    <section
      className="relative rounded-[2rem] overflow-hidden shadow-xl flex flex-col justify-end"
      style={{ minHeight: "340px" }}
    >
      {/* Gradient background — replace with real cover image when content exists */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1a3a2e 0%, #2d5a45 40%, #3a6757 70%, #4a8068 100%)",
        }}
      />

      {/* Decorative pattern layer */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px), radial-gradient(circle at 50% 80%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 40px 40px, 80px 80px",
        }}
      />

      {/* Bottom gradient for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative px-8 pb-8 pt-24 flex flex-col gap-3">
        <span
          className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-flex self-start"
          style={{
            backgroundColor: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          Weekly Edition
        </span>
        <h1
          className="text-[40px] font-extrabold leading-none tracking-tight text-white"
        >
          {edition.title}
        </h1>
        <p className="text-[16px] text-white/80 leading-snug">
          {edition.description}
        </p>
      </div>
    </section>
  );
}