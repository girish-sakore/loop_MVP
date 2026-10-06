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
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad3 = (n: number) => String(n).padStart(3, "0");
const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const parse = (v: string) => { const [y, m, d] = v.split("-").map(Number); return { y, m: m - 1, d }; };
const typeStyle = (i: number) => ({ ["--c" as string]: `var(--mb-t${i % 11})`, ["--f" as string]: `var(--mb-tf${i % 11})` });

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

  const selectedEditions = sel ? byDay.get(sel) ?? [] : [];
  const visibleSelectedEditions = cat
    ? selectedEditions.filter((edition) => edition.category === cat)
    : selectedEditions;

  return (
    <div id="v-library">
      <div className="pt"><h1>The Library</h1><p>Every box, week by week.</p></div>

      <div className="card paper" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <b style={{ fontSize: 15 }}>Access all past puzzles</b>
        <Link href="/pricing" className="chip on" style={{ ...typeStyle(1), textDecoration: "none" }}>Unlock</Link>
      </div>

      <ThemePicker />

      <div className="sech" style={{ marginTop: 18 }}>Calendar</div>
      <div className="card paper" style={{ padding: "12px 14px" }}>
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
            const matchingEditions = cat
              ? eds?.filter((edition) => edition.category === cat) ?? []
              : eds ?? [];
            const matchesFilter = matchingEditions.length > 0;
            const dimmed = !!eds && !!cat && !matchesFilter;
            const label = eds?.length
              ? `${k}: ${eds.map((edition) => edition.title).join(", ")}`
              : `${k}: no edition`;
            return (
              <button
                key={d}
                className={`day ${state} ${cat && matchesFilter ? "match" : ""} ${dimmed ? "dim" : ""} ${sel === k ? "sel" : ""}`}
                style={matchesFilter ? typeStyle(catIndex(matchingEditions[0].category)) : undefined}
                type="button"
                aria-label={label}
                aria-pressed={sel === k}
                aria-current={k === today ? "date" : undefined}
                disabled={!eds || dimmed}
                onClick={() => setSel(k)}
              >{d}</button>
            );
          })}
        </div>
        <div className="detail" id="detail" aria-live="polite">
          {visibleSelectedEditions.length ? (
            visibleSelectedEditions.map((edition) => (
              <Link key={edition.id} href={edition.href} className="calendar-edition">
                Nº {pad3(edition.order)} · {edition.category} · {edition.title}
                <span aria-hidden="true"> →</span>
              </Link>
            ))
          ) : sel && cat ? (
            `No ${cat} box was published on this day.`
          ) : (
            "Choose an available day to open its box."
          )}
        </div>
        <div className="legend">
          <span><i style={{ background: "var(--mb-red)", border: "1.5px solid var(--mb-ink)" }} />edition</span>
          <span><i style={{ border: "2.5px solid var(--mb-red)" }} />today</span>
        </div>
      </div>

      <div className="sech">Topics</div>
      <div className="chips" id="picker">
        <button className={`chip ${cat === null ? "on" : ""}`} aria-pressed={cat === null} style={{ ["--c" as string]: "var(--mb-ink)", ["--f" as string]: "var(--mb-cream)" }} onClick={() => setCat(null)}>
          <span className="cn">{editions.length}</span>All boxes
        </button>
        {categories.map((c) => (
          <button key={c} className={`chip ${cat === c ? "on" : ""}`} aria-pressed={cat === c} style={typeStyle(catIndex(c))} onClick={() => setCat(c)}>
            <span className="cn">{editions.filter((e) => e.category === c).length}</span>{c}
          </button>
        ))}
      </div>

      <div className="sech">{cat ? `Your ${cat} games` : "Latest games"}</div>
      <div className="glist" id="orders">
        {list.length ? list.map((e) => (
          <Link key={e.id} href={e.href} className="gr">
            <span className="gb" style={typeStyle(catIndex(e.category))}>{pad3(e.order)}</span>
            <span className="gm"><b>{e.title}</b><small>{e.category} · {e.weekLabel ?? e.publishedAt ?? "This week"} · {e.games} games</small></span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, opacity: 0.5 }} aria-hidden="true">lock</span>
          </Link>
        )) : <div className="mono" style={{ color: "var(--mb-cream)", fontSize: 12, padding: 10 }}>Nothing here yet.</div>}
      </div>
    </div>
  );
}
