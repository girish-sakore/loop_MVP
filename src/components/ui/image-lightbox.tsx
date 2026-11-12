"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const DOUBLE_TAP_SCALE = 2.5;

type T = { x: number; y: number; s: number };
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/* ---------- thumbnail (what sits on the quiz screen) ---------- */

export function ImageLightbox({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open image full screen"
        className={`relative block aspect-[5/4] w-full overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#f3ece2] shadow-[0_8px_0_rgba(11,11,15,0.16)] ${className}`}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-center"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0b0b0f]/80 text-white">
          <span className="material-symbols-outlined text-[18px]">open_in_full</span>
        </span>
      </button>

      {/* portal: the parent motion.div has a transform, which would trap position:fixed */}
      {open &&
        createPortal(
          <Viewer src={src} alt={alt} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}

/* ---------- fullscreen viewer ---------- */

function Viewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [t, setT] = useState<T>({ x: 0, y: 0, s: 1 });
  const tRef = useRef<T>(t);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; mx: number; my: number } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);

  // lock page scroll + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // apply a transform, keeping the image from being dragged out of view
  const apply = useCallback((next: T) => {
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img) return;
    const s = clamp(next.s, MIN_SCALE, MAX_SCALE);
    const maxX = Math.max(0, (img.offsetWidth * s - box.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * s - box.clientHeight) / 2);
    const out = { s, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
    tRef.current = out;
    setT(out);
  }, []);

  // cx/cy are relative to the centre of the screen
  const zoomTo = useCallback(
    (newS: number, cx = 0, cy = 0) => {
      const cur = tRef.current;
      const s = clamp(newS, MIN_SCALE, MAX_SCALE);
      const k = s / cur.s;
      apply({ s, x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k });
    },
    [apply]
  );

  const toCentre = (clientX: number, clientY: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { cx: clientX - (r.left + r.width / 2), cy: clientY - (r.top + r.height / 2) };
  };

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) moved.current = false;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const mid = toCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: mid.cx, my: mid.cy };
      moved.current = true;
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // two fingers: pinch + pan together
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const { cx, cy } = toCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      const cur = tRef.current;
      const s = clamp(cur.s * (dist / pinch.current.dist), MIN_SCALE, MAX_SCALE);
      const k = s / cur.s;
      apply({
        s,
        x: cx - (cx - cur.x) * k + (cx - pinch.current.mx),
        y: cy - (cy - cur.y) * k + (cy - pinch.current.my),
      });
      pinch.current = { dist, mx: cx, my: cy };
      return;
    }

    // one finger / mouse: drag to pan
    if (pointers.current.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
      const cur = tRef.current;
      apply({ ...cur, x: cur.x + dx, y: cur.y + dy });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    pinch.current = null;

    // double tap / double click: toggle zoom at the tapped point
    if (!moved.current && pointers.current.size === 0) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        const { cx, cy } = toCentre(e.clientX, e.clientY);
        zoomTo(tRef.current.s > 1.05 ? 1 : DOUBLE_TAP_SCALE, cx, cy);
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }

  function onWheel(e: React.WheelEvent) {
    const { cx, cy } = toCentre(e.clientX, e.clientY);
    zoomTo(tRef.current.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), cx, cy);
  }

  const btn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur active:bg-white/30";

  return (
    <div className="fixed inset-0 z-[100] bg-black/95" role="dialog" aria-modal="true">
      <div
        ref={boxRef}
        className={`flex h-[100dvh] w-full touch-none select-none items-center justify-center overflow-hidden ${
          t.s > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full object-contain will-change-transform"
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})` }}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`${btn} absolute right-4 top-[max(1rem,env(safe-area-inset-top))]`}
      >
        <span className="material-symbols-outlined">close</span>
      </button>

      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button type="button" aria-label="Zoom out" className={btn} onClick={() => zoomTo(tRef.current.s / 1.5)}>
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button type="button" aria-label="Reset zoom" className={btn} onClick={() => zoomTo(1)}>
          <span className="material-symbols-outlined">fit_screen</span>
        </button>
        <button type="button" aria-label="Zoom in" className={btn} onClick={() => zoomTo(tRef.current.s * 1.5)}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </div>
  );
}