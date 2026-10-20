"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "./api";
import { ErrorList, s } from "./ui";

export function UploadForm() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const file = input.current?.files?.[0];
    if (!file) return setMsg("Choose a .json file first.");
    setBusy(true); setMsg(null); setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const r = await api<{ imported: number }>("/api/admin/import", "POST", fd);
    setBusy(false);
    if (!r.ok) return setErr(r.data);
    setMsg(`Imported ${r.data.imported} card(s) into the library.`);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={s.row}>
      <input ref={input} type="file" accept="application/json,.json" />
      <button type="submit" disabled={busy} style={s.primary}>{busy ? "Importing…" : "Import"}</button>
      {msg && <span style={s.muted}>{msg}</span>}
      <div style={{ flexBasis: "100%" }}><ErrorList error={err} /></div>
    </form>
  );
}