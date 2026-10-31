import HeroIllustration from "@/components/matchbox/hero-illustration";
import type { Edition } from "@/types/gameplay";

type FeaturePalette = {
  accent: string;
  accentText: string;
  contrast: string;
  ray1: string;
  ray2: string;
  art: string;
};

const categoryPalettes: Array<[RegExp, FeaturePalette]> = [
  [/history/i, { accent: "#c13a22", accentText: "#fff7e6", contrast: "#1f7a8c", ray1: "#e8a92b", ray2: "#f2c45e", art: "#f7d77c" }],
  [/art/i, { accent: "#e8a92b", accentText: "#201b1a", contrast: "#17606f", ray1: "#c13a22", ray2: "#d9573f", art: "#f4bd59" }],
  [/literature|book/i, { accent: "#17606f", accentText: "#f7f2e6", contrast: "#c13a22", ray1: "#4d9cac", ray2: "#80c2cb", art: "#75b9c0" }],
  [/science/i, { accent: "#4b3f8f", accentText: "#f7f2e6", contrast: "#c13a22", ray1: "#6a56b0", ray2: "#9d8be4", art: "#8977ce" }],
  [/geography|travel|world/i, { accent: "#1f7a8c", accentText: "#f7f2e6", contrast: "#e8a92b", ray1: "#5bb2a9", ray2: "#94d5bf", art: "#72c5b4" }],
];

const defaultPalette: FeaturePalette = {
  accent: "#c13a22", accentText: "#fff7e6", contrast: "#1f7a8c", ray1: "#e8a92b", ray2: "#f2c45e", art: "#f7d77c",
};

function paletteFor(category: string) {
  return categoryPalettes.find(([pattern]) => pattern.test(category))?.[1] ?? defaultPalette;
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
