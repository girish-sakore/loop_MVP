"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "./api";
import { ErrorList, s } from "./ui";

type Props = {
  id: string;
  mode: "editable" | "live" | "locked";
  initial: { title: string; subtitle: string; subStages: unknown[] };
};

export function GameEditor({ id, mode, initial }: Props) {
  const router = useRouter();
  const startJson = JSON.stringify(initial.subStages, null, 2);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [json, setJson] = useState(startJson);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);

  const locked = mode === "locked";
  const dirty = title !== initial.title || subtitle !== initial.subtitle || json !== startJson;

  async function save() {
    setMsg(null); setErr(null);
    let subStages: unknown;
    try {
      subStages = JSON.parse(json);
    } catch (e) {
      return setErr({ error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` });
    }
    if (!Array.isArray(subStages)) return setErr({ error: "subStages must be a JSON array." });

    setBusy(true);
    const r = await api(`/api/admin/games/${id}`, "PATCH", { title, subtitle: subtitle.trim() || null, subStages });
    setBusy(false);
    if (!r.ok) return setErr(r.data);
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <section className="card paper" style={s.panel}>
      {locked && <p style={s.muted}>This card is in a scheduled edition. Unschedule the edition to edit it.</p>}
      {mode === "live" && <p style={s.muted}>Edition is live: text fixes only. The number of substages can&apos;t change.</p>}

      <div style={s.grid}>
        <label style={s.label}>Title
          <input style={s.input} value={title} disabled={locked} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={s.label}>Subtitle
          <input style={s.input} value={subtitle} disabled={locked} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
      </div>

      <label style={{ ...s.label, marginTop: 12 }}>Substages (JSON array)
        <textarea
          value={json}
          disabled={locked}
          spellCheck={false}
          onChange={(e) => setJson(e.target.value)}
          style={{ ...s.input, minHeight: 420, fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, whiteSpace: "pre" }}
        />
      </label>

      <div style={{ ...s.row, marginTop: 12 }}>
        <button style={s.primary} disabled={busy || locked || !dirty} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        {msg && <span style={s.muted}>{msg}</span>}
      </div>
      <ErrorList error={err} />
    </section>
  );
}