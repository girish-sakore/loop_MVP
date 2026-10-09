import HeroIllustration from "@/components/matchbox/hero-illustration";
import type { Edition } from "@/types/gameplay";

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
  return (
    <section className="mb mb-root">
      <div className={`box h ${done ? "done" : ""}`}>
        <span className="strike b" />
        <span className="half" />
        <span className="stamp">STRUCK</span>
        <i className="co tl" /><i className="co tr" /><i className="co bl" /><i className="co br" />
        <div className="hgrid">
          <div className="arch"><HeroIllustration /></div>
          <div className="hcopy">
            <div className="row">
              <span className="pill">TODAY</span>
              <span className="mono lt">★ {category.toUpperCase()} ★</span>
            </div>
            <h2>{title ?? edition.title}</h2>
            <div className="chips2">
              <span>{category}</span>
              {total > 0 && <span>{gamesDone !== undefined ? `${gamesDone}/${total}` : total} games</span>}
              <span>{edition.weekLabel ?? formatDate(edition.publishedAt)}</span>
            </div>
          </div>
        </div>
        <div className="foot"><span>{edition.description}</span><span>Nº {String(edition.order ?? 0).padStart(3, "0")}</span></div>
      </div>
    </section>
  );
}