"use client";

import { useState, type FormEvent } from "react";

import { dailyGameTypes } from "@/lib/daily-game-validation";

const initialPayload = `{
  "type": "image-select",
  "mapTitle": "Daily discovery",
  "mapSubtitle": "Choose the right answer.",
  "subStages": [
    {
      "id": "daily-stage-1",
      "question": "Which answer is correct?",
      "attemptsAllowed": 3,
      "points": 100,
      "options": []
    }
  ]
}`;

export function DailyGameForm() {
  const [scheduledFor, setScheduledFor] = useState(today());
  const [type, setType] = useState("image-select");
  const [json, setJson] = useState(initialPayload);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErrors([]); setSuccess(null);
    let payload: unknown;
    try { payload = JSON.parse(json); } catch { setErrors(["Enter valid JSON before saving."]); return; }
    setSaving(true);
    const response = await fetch("/api/provider/daily-games", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledFor, type, payload }),
    });
    const result = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) { setErrors(result?.errors ?? [result?.error ?? "Could not save the daily match."]); return; }
    setSuccess(`Saved ${result.game.type} for ${scheduledFor}. Saving that date again updates it.`);
  }

  return <form onSubmit={submit} className="rounded-[20px] border-[3px] border-[#1e1b18] bg-[#e9512d] p-5 text-[#f8f1e3] shadow-[0_7px_0_#1e1b18]">
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-extrabold">Publish date<input required type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="rounded-lg border-2 border-[#1e1b18] bg-[#f8f1e3] px-3 py-2 text-[#1e1b18]" /></label><label className="grid gap-2 text-sm font-extrabold">Interaction type<select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border-2 border-[#1e1b18] bg-[#f8f1e3] px-3 py-2 text-[#1e1b18]">{dailyGameTypes.map((gameType) => <option key={gameType}>{gameType}</option>)}</select></label></div>
    <label className="mt-4 grid gap-2 text-sm font-extrabold">Game JSON<textarea value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} className="min-h-90 w-full rounded-lg border-2 border-[#1e1b18] bg-[#1e1b18] p-3 font-mono text-[13px] leading-relaxed text-[#f8f1e3] outline-none focus:ring-2 focus:ring-[#f7bd41]" /></label>
    {errors.length > 0 ? <ul className="mt-4 list-disc rounded-lg bg-[#5f2119] px-8 py-3 text-sm">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}
    {success ? <p className="mt-4 rounded-lg bg-[#f7bd41] px-3 py-2 font-bold text-[#1e1b18]">{success}</p> : null}
    <button disabled={saving} type="submit" className="mt-5 rounded-xl border-2 border-[#1e1b18] bg-[#f7bd41] px-5 py-3 font-extrabold uppercase tracking-wide text-[#1e1b18] shadow-[0_3px_0_#1e1b18] disabled:opacity-60">{saving ? "Saving…" : "Save daily match"}</button>
  </form>;
}

function today() { return new Date().toISOString().slice(0, 10); }
