"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "./api";
import { ErrorList, s } from "./ui";

export type Card = { id: string; type: string; title: string; isPremium: boolean; subStageCount: number };
export type LibGame = { id: string; type: string; title: string; subStageCount: number };
export type Meta = { title: string; description: string; theme: string; category: string; author: string; coverImage: string; estimatedTime: string; date: string };
type Mode = "draft" | "scheduled" | "live";
type R = { ok: boolean; data: ApiError };

export function EditionBuilder(props: { editionId: string; mode: Mode; initialMeta: Meta; initialCards: Card[]; library: LibGame[] }) {
  const { editionId, mode, initialMeta, initialCards, library } = props;
  const router = useRouter();
  const [meta, setMeta] = useState(initialMeta);
  const [cards, setCards] = useState(initialCards);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const base = `/api/admin/editions/${editionId}`;
  const draft = mode === "draft";
  const sig = (c: Card[]) => JSON.stringify(c.map((x) => [x.id, x.isPremium]));
  const dirty = sig(cards) !== sig(initialCards);
  const metaDirty = JSON.stringify(meta) !== JSON.stringify(initialMeta);

  async function run(fn: () => Promise<R | undefined>, after?: () => void) {
    setBusy(true); setErr(null);
    const r = await fn();
    setBusy(false);
    if (!r) return; // cancelled
    if (!r.ok) return setErr(r.data);
    after ? after() : router.refresh();
  }

  const addGame = async (gameId: string, merge = false): Promise<R | undefined> => {
    const r = await api(`${base}/games`, "POST", { gameId, merge });
    if (r.status === 409 && r.data.code === "TYPE_CONFLICT") {
      const ok = window.confirm(`${r.data.error}\n\nMerge into "${r.data.existingTitle}"? Its substages are appended and the library card is removed.`);
      return ok ? addGame(gameId, true) : undefined;
    }
    return r;
  };

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= cards.length) return;
    const next = [...cards];
    [next[i], next[j]] = [next[j], next[i]];
    setCards(next);
  }
  const togglePremium = (i: number) => setCards(cards.map((c, k) => (k === i ? { ...c, isPremium: !c.isPremium } : c)));

  const saveMeta = () =>
    run(() =>
      api(base, "PATCH", {
        title: meta.title, description: meta.description, theme: meta.theme,
        category: meta.category || null, author: meta.author || null, coverImage: meta.coverImage || null,
        estimatedTime: meta.estimatedTime || null, date: meta.date || null,
      }),
    );
  const saveCards = () => run(() => api(`${base}/order`, "PUT", { cards: cards.map((c) => ({ gameId: c.id, isPremium: c.isPremium })) }));
  const schedule = () => run(() => api(`${base}/schedule`, "POST"));
  const unschedule = () => run(() => api(`${base}/schedule`, "DELETE"));
  const remove = (gameId: string) => run(() => api(`${base}/games?gameId=${gameId}`, "DELETE"));
  const del = () => {
    if (!window.confirm("Delete this draft? Its cards go back to the library.")) return;
    run(() => api(base, "DELETE"), () => router.push("/admin/editions"));
  };

  const metaField = (k: keyof Meta, label: string, type = "text") => (
    <label style={s.label}>{label}
      <input style={s.input} type={type} value={meta[k]} disabled={!draft} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} />
    </label>
  );

  const freeCount = cards.filter((c) => !c.isPremium).length;

  return (
    <>
      <section className="card paper" style={s.panel}>
        <div style={{ ...s.row, justifyContent: "space-between" }}>
          <b>
            {mode === "draft" && "Draft: everything is editable."}
            {mode === "scheduled" && "Scheduled: unschedule to make changes."}
            {mode === "live" && "Live: only premium flags can change."}
          </b>
          <div style={s.row}>
            {draft && <button style={s.primary} disabled={busy || dirty || metaDirty} onClick={schedule}>Schedule</button>}
            {mode === "scheduled" && <button style={s.btn} disabled={busy} onClick={unschedule}>Unschedule</button>}
            {draft && <button style={s.danger} disabled={busy} onClick={del}>Delete</button>}
          </div>
        </div>
        {draft && (dirty || metaDirty) && <div style={s.muted}>Save your changes before scheduling.</div>}
        <ErrorList error={err} />
      </section>

      <section className="card paper" style={s.panel}>
        <h2 style={s.h2}>Details</h2>
        <div style={s.grid}>
          {metaField("title", "Title")}
          {metaField("theme", "Theme key")}
          {metaField("date", "Date (IST)", "date")}
          {metaField("category", "Category")}
          {metaField("author", "Author")}
          {metaField("estimatedTime", "Estimated time")}
          {metaField("coverImage", "Cover image URL")}
        </div>
        <div style={{ marginTop: 10 }}>{metaField("description", "Description")}</div>
        {draft && <div style={{ marginTop: 12 }}><button style={s.primary} disabled={busy || !metaDirty} onClick={saveMeta}>Save details</button></div>}
      </section>

      <section className="card paper" style={s.panel}>
        <div style={{ ...s.row, justifyContent: "space-between" }}>
          <h2 style={{ ...s.h2, margin: 0 }}>Cards ({cards.length}) · {freeCount} free</h2>
          {(draft || mode === "live") && <button style={s.primary} disabled={busy || !dirty} onClick={saveCards}>Save changes</button>}
        </div>
        <p style={s.muted}>One card per game type. Free users can play only the cards left unchecked under Premium.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={s.th}>#</th><th style={s.th}>Card</th><th style={s.th}>Substages</th><th style={s.th}>Premium</th><th style={s.th} /></tr></thead>
          <tbody>
            {cards.map((c, i) => (
              <tr key={c.id}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}><b>{c.title}</b><div style={s.muted}>{c.type}</div></td>
                <td style={s.td}>{c.subStageCount}</td>
                <td style={s.td}>
                  <input type="checkbox" checked={c.isPremium} disabled={!draft && mode !== "live"} onChange={() => togglePremium(i)} />
                </td>
                <td style={{ ...s.td, textAlign: "right", whiteSpace: "nowrap" }}>
                  {draft && (
                    <>
                      <button style={s.btn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>{" "}
                      <button style={s.btn} disabled={i === cards.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>{" "}
                      <button style={s.danger} disabled={busy || dirty} onClick={() => remove(c.id)}>Remove</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {cards.length === 0 && <tr><td style={s.td} colSpan={5}>No cards yet. Add some from the library below.</td></tr>}
          </tbody>
        </table>
        {draft && dirty && <div style={s.muted}>Save changes before adding or removing cards.</div>}
      </section>

      {draft && (
        <section className="card paper" style={s.panel}>
          <h2 style={s.h2}>Add from library ({library.length})</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {library.map((g) => (
                <tr key={g.id}>
                  <td style={s.td}><b>{g.title}</b><div style={s.muted}>{g.type} · {g.subStageCount} substages</div></td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    <button style={s.btn} disabled={busy || dirty} onClick={() => run(() => addGame(g.id))}>Add</button>
                  </td>
                </tr>
              ))}
              {library.length === 0 && <tr><td style={s.td}>Library is empty. Import a file first.</td></tr>}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}