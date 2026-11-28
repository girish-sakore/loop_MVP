import HeroIllustration from "@/components/matchbox/hero-illustration";
import { categoryKey, type CategoryKey } from "@/components/edition-intro/category-key";
import type { Edition } from "@/types/gameplay";

type FeaturePalette = {
  accent: string; // main object colour
  accentText: string; // text colour that sits on accent
  contrast: string; // secondary object colour
  ray1: string; // highlights / gold details
  ray2: string; // light tint, used for the sunburst
  art: string; // art panel background
};

const palettes: Record<CategoryKey, FeaturePalette> = {
  geography:     { accent: "#14a085", accentText: "#f2fffb", contrast: "#e8590c", ray1: "#f6c945", ray2: "#8be0cd", art: "#bff0e6" }, // teal
  history:       { accent: "#92602a", accentText: "#fff6e5", contrast: "#1f6f8b", ray1: "#e9b44c", ray2: "#f3d58d", art: "#f0dcae" }, // bronze
  food:          { accent: "#e8432e", accentText: "#fff6ee", contrast: "#2f9e44", ray1: "#ffc93c", ray2: "#f2a65a", art: "#ffe0b0" }, // tomato
  literature:    { accent: "#2f5fd8", accentText: "#f4f7ff", contrast: "#f59e0b", ray1: "#ffd166", ray2: "#b9c9ff", art: "#d6e0ff" }, // royal blue
  music:         { accent: "#c026d3", accentText: "#fff2ff", contrast: "#ffb703", ray1: "#ffd23f", ray2: "#f0abfc", art: "#f8d3fb" }, // fuchsia
  mythology:     { accent: "#6d3fd0", accentText: "#f6f0ff", contrast: "#3f9b5f", ray1: "#ffd23f", ray2: "#c4b0f5", art: "#e2d6fa" }, // violet + gold
  sports:        { accent: "#84cc16", accentText: "#1b2a05", contrast: "#e03a3e", ray1: "#ffb703", ray2: "#d8f28f", art: "#e6f7bf" }, // lime
  science:       { accent: "#00b4d8", accentText: "#032430", contrast: "#d946ef", ray1: "#ffd166", ray2: "#8fe3f2", art: "#c9f1fa" }, // cyan
  travel:        { accent: "#ff7a45", accentText: "#2b0f02", contrast: "#2f9bff", ray1: "#ffd166", ray2: "#ffc6a8", art: "#ffe0cc" }, // sunset orange
  art:           { accent: "#facc15", accentText: "#2a2000", contrast: "#e11d48", ray1: "#3b82f6", ray2: "#fb923c", art: "#fff1a8" }, // yellow
  business:      { accent: "#1e3a5f", accentText: "#f3f7fc", contrast: "#f2b705", ray1: "#f6c945", ray2: "#6f93c0", art: "#cfdcee" }, // navy
  architecture:  { accent: "#64748b", accentText: "#f6f8fa", contrast: "#c2552d", ray1: "#e6a37c", ray2: "#cbd5e1", art: "#e3e9ee" }, // slate
  fashion:       { accent: "#1f2937", accentText: "#fdf2f8", contrast: "#ec4899", ray1: "#f9a8d4", ray2: "#fbc6de", art: "#fdd9e8" }, // charcoal + pink
  culture:       { accent: "#d6336c", accentText: "#fff0f5", contrast: "#f59e0b", ray1: "#fbbf24", ray2: "#f8a6c0", art: "#fcd5e1" }, // raspberry
  entertainment: { accent: "#dc2626", accentText: "#fff1f0", contrast: "#f59e0b", ray1: "#fde68a", ray2: "#fca5a5", art: "#fdd0cc" }, // cinema red
  etymology:     { accent: "#7a8b1f", accentText: "#fbfde6", contrast: "#b45309", ray1: "#facc15", ray2: "#d9e07a", art: "#e8edb6" }, // olive
  nature:        { accent: "#2f9e44", accentText: "#f2fff5", contrast: "#1b5e3a", ray1: "#ffd23f", ray2: "#9bd7a8", art: "#cdeed6" }, // forest
};

function paletteFor(category: string) {
  return palettes[categoryKey(category)];
}

interface EditionHeroProps {
  edition: Edition;
  /** Overrides edition.title (e.g. the village title shown as today's theme) */
  title?: string;
  gamesDone?: number;
  gamesTotal?: number;
  done?: boolean;
}

function formatDate(value: string | undefined) {
  if (!value) return "This week";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function EditionHero({ edition, title, gamesDone, gamesTotal, done = false }: EditionHeroProps) {
  const total = gamesTotal ?? edition.nodes?.length ?? 0;
  const category = edition.category ?? "Featured";
  const palette = paletteFor(category);
  const gameCount = gamesDone === undefined ? `${total} ${total === 1 ? "game" : "games"}` : `${gamesDone}/${total} games`;
  return (
    <section
      className={`edition-feature ${done ? "is-complete" : ""}`}
      style={{
        ["--feature-accent" as string]: palette.accent,
        ["--feature-accent-text" as string]: palette.accentText,
        ["--feature-contrast" as string]: palette.contrast,
        ["--feature-ray-1" as string]: palette.ray1,
        ["--feature-ray-2" as string]: palette.ray2,
        ["--feature-art" as string]: palette.art,
      }}
    >
      <div className="edition-feature-card">
        <div className="edition-feature-banner">{done ? "COMPLETED" : "TODAY'S EDITION"}</div>
        <div className="edition-feature-art">
          <HeroIllustration category={category} />
          <span>{category}</span>
        </div>
        <div className="edition-feature-copy">
          <h2>{title ?? edition.title}</h2>
          <p>{edition.description || "A fresh set of questions is ready for you."}</p>
        </div>
        <div className="edition-feature-meta">
          <span>Nº {String(edition.order ?? 0).padStart(3, "0")} · {edition.weekLabel ?? formatDate(edition.publishedAt)}</span>
          <span>{gameCount}{edition.estimatedTime ? ` · ${edition.estimatedTime}` : ""}</span>
        </div>
      </div>
    </section>
  );
}