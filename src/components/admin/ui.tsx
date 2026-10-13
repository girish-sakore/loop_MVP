import type { CSSProperties } from "react";
import type { ApiError } from "./api";

export const s = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "20px 16px 80px" } as CSSProperties,
  panel: { padding: 16, marginTop: 16 } as CSSProperties,
  h2: { fontSize: 18, fontWeight: 800, margin: "0 0 12px" } as CSSProperties,
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } as CSSProperties,
  grid: { display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" } as CSSProperties,
  label: { display: "grid", gap: 4, fontSize: 13, fontWeight: 700 } as CSSProperties,
  input: { padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,.35)", font: "inherit", background: "#fff", color: "#111", width: "100%" } as CSSProperties,
  btn: { padding: "7px 14px", borderRadius: 10, border: "2px solid #111", background: "#fff", color: "#111", font: "inherit", fontWeight: 700, cursor: "pointer" } as CSSProperties,
  primary: { padding: "7px 14px", borderRadius: 10, border: "2px solid #111", background: "#ffd54a", color: "#111", font: "inherit", fontWeight: 700, cursor: "pointer" } as CSSProperties,
  danger: { padding: "7px 14px", borderRadius: 10, border: "2px solid #b3261e", background: "#fff", color: "#b3261e", font: "inherit", fontWeight: 700, cursor: "pointer" } as CSSProperties,
  th: { textAlign: "left", padding: "6px 8px", fontSize: 12, opacity: 0.7 } as CSSProperties,
  td: { padding: "8px", borderTop: "1px solid rgba(0,0,0,.12)", verticalAlign: "middle" } as CSSProperties,
  muted: { opacity: 0.65, fontSize: 13 } as CSSProperties,
};

export function ErrorList({ error }: { error: ApiError | null }) {
  if (!error) return null;
  const items = [
    ...(error.errors ?? []).map((e) => `${e.path}: ${e.message}`),
    ...(error.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`),
  ];
  return (
    <div role="alert" style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#fdecea", color: "#7a1710", fontSize: 14 }}>
      <b>{error.error ?? "Something went wrong."}</b>
      {items.length > 0 && (
        <ul style={{ margin: "6px 0 0", paddingLeft: 18, maxHeight: 200, overflow: "auto" }}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
      {error.totalErrors && error.totalErrors > items.length ? <div style={{ marginTop: 4 }}>…and {error.totalErrors - items.length} more</div> : null}
    </div>
  );
}