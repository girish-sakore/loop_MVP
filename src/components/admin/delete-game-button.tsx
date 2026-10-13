"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  return <button onClick={del} disabled={busy} style={s.danger}>Delete</button>;
}