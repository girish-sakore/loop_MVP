import { assetUrl } from "@/lib/assets";
import {
  PLAY_HREF, HERO, VIDEO, GAMES_HEAD, GAMES, GAMES_NOTE,
  WHY, VALUES, PLAY_BAND, FOOTER,
} from "@/features/landing/landing-content";
import Link from "next/link";

export function Header() {
  return (

    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Loop home">
          LOOP<span>.</span>
        </Link>
      </div>
      <a className="l-btn l-btn--primary l-btn--sm" href={PLAY_HREF}>Play today&apos;s theme</a>
    </header>


    //   <header className="l-header">
    //   <div className="l-logo">LOOP<i>.</i></div>
    // </header>
  );
}

export function Hero() {
  return (
    <section className="l-hero">
      <p className="l-eyebrow">{HERO.eyebrow}</p>
      <h1 className="l-display l-h1">{HERO.title}</h1>
      <p className="l-lead">{HERO.body}</p>
      <div className="l-actions">
        <a className="l-btn l-btn--primary" href={PLAY_HREF}>Play today&apos;s theme</a>
        <a className="l-btn" href="#games">Explore games</a>
      </div>
      <p className="l-fine">{HERO.fine}</p>
    </section>
  );
}

export function VideoSection() {
  return (
    <section className="l-wrap l-section" aria-label="How Loop works">
      <div className="l-label">
        <video
          className="l-video"
          controls
          playsInline
          preload="none"
          poster={assetUrl(VIDEO.poster)}
          aria-label="Video showing all eight Loop games"
        >
          <source src={assetUrl(VIDEO.src)} type="video/mp4" />
        </video>
      </div>
      <p className="l-caption">{VIDEO.caption}</p>
    </section>
  );
}

export function WhySection() {
  return (
    <section className="l-why">
      <div className="l-wrap">
        <p className="l-kicker">{WHY.kicker}</p>
        <h2 className="l-display l-h2">{WHY.title}</h2>
        <p>{WHY.body}</p>
      </div>
    </section>
  );
}

export function GamesSection() {
  return (
    <section id="games" className="l-wrap l-section">
      <h2 className="l-display l-h2">{GAMES_HEAD.title}</h2>
      <p className="l-sub">{GAMES_HEAD.body}</p>
      <div className="l-grid l-games">
        {GAMES.map((g, i) => (
          <article className="l-card l-game" key={g.name}>
            <span className="l-kicker">GAME {i + 1}</span>
            <h3 className="l-display">{g.name}</h3>
            <p>{g.line}</p>
          </article>
        ))}
      </div>
      <p className="l-note">{GAMES_NOTE}</p>
    </section>
  );
}

export function ValuesSection() {
  return (
    <section className="l-wrap l-section">
      <div className="l-grid">
        {VALUES.map((v) => (
          <article key={v.title} className={`l-card l-value ${v.highlight ? "l-value--hl" : ""}`}>
            <h3 className="l-display">{v.title}</h3>
            <p>{v.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PlayBand() {
  return (
    <section className="l-play">
      <h2 className="l-display l-h2">{PLAY_BAND.title}</h2>
      <div className="l-actions">
        <a className="l-btn l-btn--primary" href={PLAY_HREF}>Play today&apos;s theme</a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="l-foot">
      <span>© Loop</span>
      <nav aria-label="Legal">
        {FOOTER.links.map((l) => (
          <a key={l.label} href={l.href}>{l.label}</a>
        ))}
      </nav>
    </footer>
  );
}