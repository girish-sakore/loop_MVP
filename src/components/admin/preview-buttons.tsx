"use client";
import { useRouter } from "next/navigation";
import { closePreviewTab } from "@/features/gameplay/preview/close-preview";
import { s } from "./ui";

/** Opens the preview in a script-opened tab, so the tab can close itself later. */
export function PreviewLink({ gameId, children = "Preview", title, style }: {
  gameId: string; children?: React.ReactNode; title?: string; style?: React.CSSProperties;
}) {
  const href = `/admin-preview/${gameId}`;
  return (
    <a
      href={href}
      title={title}
      aria-label={title}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        window.open(href, "_blank");
      }}
    >
      {children}
    </a>
  );
}

export function ClosePreviewButton({ fallback, label = "Close preview" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <button style={s.primary} onClick={() => closePreviewTab(fallback, (h) => router.push(h))}>
      {label}
    </button>
  );
}