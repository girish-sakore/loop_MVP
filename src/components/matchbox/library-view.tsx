"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ThemePicker from "./theme-picker";

export interface LibraryEdition {
  id: string;
  title: string;
  category: string;
  /** ISO date YYYY-MM-DD */
  publishedAt?: string;
  weekLabel?: string;
  order: number;
  games: number;
  href: string;
  locked: boolean;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad3 = (n: number) => String(n).padStart(3, "0");
const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const parse = (v: string) => { const [y, m, d] = v.split("-").map(Number); return { y, m: m - 1, d }; };
const topicColour: Record<string, number> = { History: 0, Art: 1, Literature: 4, Science: 6 };
const typeStyle = (category: string, fallback: number) => {
  const i = topicColour[category] ?? fallback % 11;
  return { ["--c" as string]: `var(--mb-t${i})`, ["--f" as string]: `var(--mb-tf${i})` };
};
const shortDate = (value?: string) => {
  if (!value) return "This week";
  const { y, m, d } = parse(value);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(y, m, d)));
};

export default function LibraryView({ editions }: { editions: LibraryEdition[] }) {
  const categories = useMemo(() => Array.from(new Set(editions.map((e) => e.category))), [editions]);
  const catIndex = (c: string) => Math.max(0, categories.indexOf(c));

  const byDay = useMemo(() => {
    const map = new Map<string, LibraryEdition[]>();
    editions.forEach((e) => { if (e.publishedAt) map.set(e.publishedAt, [...(map.get(e.publishedAt) ?? []), e]); });
    return map;
  }, [editions]);

  const monthKeys = useMemo(() => {
    const ms = Array.from(byDay.keys()).map((k) => { const { y, m } = parse(k); return y * 12 + m; });
    const now = new Date(); const cur = now.getFullYear() * 12 + now.getMonth();
    return ms.length ? { min: Math.min(...ms), max: Math.max(...ms) } : { min: cur, max: cur };
  }, [byDay]);

  const [ym, setYm] = useState(monthKeys.max);
  const [cat, setCat] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const y = Math.floor(ym / 12), m = ym % 12;
  const first = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
  const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const now = new Date();
  const today = key(now.getFullYear(), now.getMonth(), now.getDate());

  const list = editions
    .filter((e) => !cat || e.category === cat)
    .slice()
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.order - b.order);

  const selEditions = sel ? byDay.get(sel) : undefined;
  const detail = selEditions?.length
    ? `${selEditions.map((e) => `Nº ${pad3(e.order)} · ${e.category} · ${e.title}`).join("  |  ")}`
    : "Tap a day to open its edition.";

  return (
    <>
      <header className="library-heading">
        <h1>The Library</h1>
        <p>Every box, week by week.</p>
      </header>

      <div className="library-promo">
        <b>Access all past puzzles</b>
        <Link href="/pricing">Go Premium</Link>
      </div>

      {/* <div className="library-theme-picker"><ThemePicker /></div> */}

      <div className="library-section-title">Calendar</div>
      <section className="library-calendar" aria-label="Edition calendar">
        <div className="calhead">
          <button className="cnav" aria-label="Previous month" disabled={ym <= monthKeys.min} onClick={() => setYm(ym - 1)}>‹</button>
          <h3>{MONTHS[m]} {y}</h3>
          <button className="cnav" aria-label="Next month" disabled={ym >= monthKeys.max} onClick={() => setYm(ym + 1)}>›</button>
        </div>
        <div className="cal">{"MTWTFSS".split("").map((x, i) => <div key={i} className="w">{x}</div>)}</div>
        <div className="cal" style={{ marginTop: 6 }}>
          {Array.from({ length: first }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: dim }, (_, i) => {
            const d = i + 1, k = key(y, m, d), eds = byDay.get(k);
            const state = eds ? "done" : k === today ? "today" : "";
            const dimmed = !!eds && !!cat && !eds.some((e) => e.category === cat);
            return (
              <button
                key={d}
                className={`day ${state} ${dimmed ? "dim" : ""} ${sel === k ? "sel" : ""}`}
                style={eds ? typeStyle(eds[0].category, catIndex(eds[0].category)) : undefined}
                onClick={() => { if (eds) setSel(k); }}
              >{d}</button>
            );
          })}
        </div>
        <div className="detail" id="detail">{detail}</div>
      </section>

      <div className="library-section-title">Topics</div>
      <div className="library-chips" id="picker">
        <button className={`chip ${cat === null ? "on" : ""}`} aria-pressed={cat === null} style={{ ["--c" as string]: "var(--mb-red)", ["--f" as string]: "var(--mb-cream)" }} onClick={() => setCat(null)}>
          <span className="cn">{editions.length}</span>All
        </button>
        {categories.map((c) => (
          <button key={c} className={`chip ${cat === c ? "on" : ""}`} aria-pressed={cat === c} style={typeStyle(c, catIndex(c))} onClick={() => setCat(c)}>
            <span className="cn">{editions.filter((e) => e.category === c).length}</span>{c}
          </button>
        ))}
      </div>

      <div className="library-section-title">{cat ? `${cat} editions` : "Latest editions"}</div>
      <div className="library-list" id="orders">
        {list.length ? list.map((e) => (
          <Link key={e.id} href={e.locked ? "/pricing" : e.href} className={`gr${e.locked ? " locked" : ""}`} aria-label={e.locked ? `Unlock ${e.title} with Premium` : undefined}>
            <span className="gb" style={typeStyle(e.category, catIndex(e.category))}>{pad3(e.order)}</span>
            <span className="gm"><b>{e.title}</b><small>{e.category} · {shortDate(e.publishedAt)} · {e.games} {e.games === 1 ? "game" : "games"}</small></span>
            {e.locked && <span className="material-symbols-outlined library-lock" aria-hidden="true">lock</span>}
          </Link>
        )) : <div className="mono" style={{ color: "var(--mb-cream)", fontSize: 12, padding: 10 }}>Nothing here yet.</div>}
      </div>
    </>
  );
}
