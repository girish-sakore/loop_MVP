"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "./api";
import { s } from "./ui";

export function DeleteGameButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    setBusy(true);
    const r = await api(`/api/admin/games/${id}`, "DELETE");
    setBusy(false);
    if (!r.ok) return window.alert(r.data.error ?? "Delete failed.");
    router.refresh();
  }
  return (
    <button onClick={del} disabled={busy} title="Delete" aria-label="Delete" style={{ ...s.iconDanger, opacity: busy ? 0.5 : 1 }}>
      <Trash2 size={16} />
    </button>
  );
}