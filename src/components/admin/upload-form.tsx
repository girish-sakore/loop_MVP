"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ApiError } from "./api";
import { ErrorList, s } from "./ui";
import { analyse, rewriteWithKeys, uploadMissing } from "./image-pipeline";

export function UploadForm() {
  const router = useRouter();
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [json, setJson] = useState<unknown>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<ApiError | null>(null);

  const report = useMemo(() => (json ? analyse(json, files) : null), [json, files]);
  const blocked = !report || report.missing.length > 0 || report.ambiguous.length > 0;

  async function pickJson(f?: File) {
    setErr(null); setMsg(null);
    if (!f) return;
    try {
      setJson(JSON.parse(await f.text()));
      setJsonFile(f);
    } catch {
      setJson(null); setJsonFile(null);
      setMsg("That file is not valid JSON.");
    }
  }

  function addFiles(list: FileList | File[]) {
    const imgs = [...list].filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => `${p.name}:${p.size}`));
      return [...prev, ...imgs.filter((f) => !seen.has(`${f.name}:${f.size}`))];
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!jsonFile || !report || blocked) return;
    setBusy(true); setMsg("Checking…"); setErr(null);
    try {
      const { rewritten, keyToFile } = await rewriteWithKeys(json, report.matched);
      const form = (dryRun = false) => {
        const fd = new FormData();
        fd.append("file", new File([JSON.stringify(rewritten)], jsonFile.name, { type: "application/json" }));
        if (dryRun) fd.append("dryRun", "1");
        return fd;
      };

      // 1. Validate before uploading anything
      const dry = await api<{ ok: boolean }>("/api/admin/import", "POST", form(true));
      if (!dry.ok) return setErr(dry.data);

      // 2. Compress + upload straight to R2
      await uploadMissing(keyToFile, setMsg);

      // 3. Save games (server re-checks every key exists in R2)
      setMsg("Saving…");
      const r = await api<{ imported: number }>("/api/admin/import", "POST", form());
      if (!r.ok) return setErr(r.data);

      setMsg(`Imported ${r.data.imported} card(s) into the library.`);
      setJson(null); setJsonFile(null); setFiles([]);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={s.row}>
        <label>1. Edition JSON&nbsp;
          <input type="file" accept="application/json,.json" onChange={(e) => pickJson(e.target.files?.[0])} />
        </label>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        style={{ border: "2px dashed #999", borderRadius: 8, padding: 16 }}
      >
        <div>2. Drop all images here, or{" "}
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </div>
        <div style={s.muted}>{files.length} image(s) added</div>
      </div>

      {report && (
        <div style={s.muted}>
          <div>
            {report.total} referenced · {report.matched.size} matched · {report.missing.length} missing
          </div>
          {report.missing.length > 0 && <div style={{ color: "crimson" }}>Missing: {report.missing.join(", ")}</div>}
          {report.ambiguous.length > 0 && <div style={{ color: "crimson" }}>Two files match: {report.ambiguous.join(", ")}</div>}
          {report.legacy.length > 0 && <div>Kept as /public paths: {report.legacy.length}</div>}
          {report.unused.length > 0 && <div>Unused files (ignored): {report.unused.map((f) => f.name).join(", ")}</div>}
        </div>
      )}

      <div style={s.row}>
        <button type="submit" disabled={busy || blocked} style={s.primary}>{busy ? "Working…" : "Import"}</button>
        {msg && <span style={s.muted}>{msg}</span>}
      </div>
      <ErrorList error={err} />
    </form>
  );
}