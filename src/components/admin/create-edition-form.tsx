"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "./api";
import { ErrorList, s } from "./ui";

const CATEGORIES = [
  "Geography",
  "History",
  "Food",
  "Literature",
  "Music",
  "Mythology",
  "Sports",
  "Science & Technology",
  "Travel",
  "Art",
  "Business & Finance",
  "Architecture",
  "Fashion",
  "Culture",
  "Entertainment",
  "Etymology",
  "Nature",
];
const empty = { title: "", description: "", theme: "", date: "", category: "", author: "", estimatedTime: "", coverImage: "" };

export function CreateEditionForm() {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const set =
    (k: keyof typeof empty) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    // drop empty optional fields so the API treats them as unset
    const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v.trim() !== ""));
    const r = await api<{ edition: { id: string } }>("/api/admin/editions", "POST", body);
    setBusy(false);
    if (!r.ok) return setErr(r.data);
    router.push(`/admin/editions/${r.data.edition.id}`);
  }

  const field = (k: keyof typeof empty, label: string, type = "text", required = false) => (
    <label style={s.label}>{label}<input style={s.input} type={type} value={f[k]} onChange={set(k)} required={required} /></label>
  );

  const select = (k: keyof typeof empty, label: string, options: string[], required = false) => (
    <label style={s.label}>{label}
      <select style={s.input} value={f[k]} onChange={set(k)} required={required}>
        <option value="">Select {label.toLowerCase()}…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <form onSubmit={submit}>
      <div style={s.grid}>
        {field("title", "Title", "text", true)}
        {field("theme", "Theme key (e.g. salt-village)", "text", true)}
        {field("date", "Date (IST)", "date")}
        {select("category", "Category", CATEGORIES)}
        {field("author", "Author")}
        {field("estimatedTime", "Estimated time (e.g. 5 mins)")}
        {field("coverImage", "Cover image URL")}
      </div>
      <label style={{ ...s.label, marginTop: 10 }}>Description
        <input style={s.input} value={f.description} onChange={set("description")} required />
      </label>
      <div style={{ ...s.row, marginTop: 12 }}>
        <button type="submit" disabled={busy} style={s.primary}>{busy ? "Creating…" : "Create draft"}</button>
      </div>
      <ErrorList error={err} />
    </form>
  );
}