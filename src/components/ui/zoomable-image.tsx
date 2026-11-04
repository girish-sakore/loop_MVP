"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    src: string;
    alt?: string;
    zoom?: number;     // magnification
    lensSize?: number; // px, square zoom window
    className?: string;
};

type Lens = { x: number; y: number; rx: number; ry: number; fw: number; dw: number; dh: number };

export function ZoomableImage({ src, alt = "", zoom = 2.5, lensSize = 132, className = "" }: Props) {
    const frameRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
    const [lens, setLens] = useState<Lens | null>(null);

    // handles images that finished loading before hydration
    useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth) {
            setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        }
    }, [src]);

    function update(e: React.PointerEvent) {
        const frame = frameRef.current;
        if (!frame || !natural) return;

        const rect = frame.getBoundingClientRect();
        const fw = rect.width;
        const fh = rect.height;

        // rendered size/offset of the image inside the frame (object-contain)
        const s = Math.min(fw / natural.w, fh / natural.h);
        const dw = natural.w * s;
        const dh = natural.h * s;
        const ox = (fw - dw) / 2;
        const oy = (fh - dh) / 2;

        const x = Math.min(Math.max(e.clientX - rect.left, 0), fw);
        const y = Math.min(Math.max(e.clientY - rect.top, 0), fh);
        const rx = Math.min(Math.max((x - ox) / dw, 0), 1);
        const ry = Math.min(Math.max((y - oy) / dh, 0), 1);

        setLens({ x, y, rx, ry, fw, dw, dh });
    }

    const lensLeft = lens
        ? Math.max(0, Math.min(lens.x - lensSize / 2, lens.fw - lensSize))
        : 0;
    const above = lens ? lens.y - lensSize - 28 : 0;
    const lensTop = lens ? (above < -120 ? lens.y + 36 : above) : 0;

    return (
        <div className={`relative ${className}`}>
            <div
                ref={frameRef}
                className="relative aspect-[5/4] w-full cursor-zoom-in touch-none select-none overflow-hidden rounded-md border-[3px] border-[#0b0b0f] bg-[#f3ece2] shadow-[0_8px_0_rgba(11,11,15,0.16)] [-webkit-touch-callout:none]"
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    update(e);
                }}
                onPointerMove={(e) => {
                    if (e.pointerType === "mouse" || e.buttons > 0) update(e);
                }}
                onPointerUp={(e) => e.pointerType !== "mouse" && setLens(null)}
                onPointerCancel={() => setLens(null)}
                onPointerLeave={() => setLens(null)}
                onContextMenu={(e) => e.preventDefault()}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    draggable={false}
                    onLoad={(e) =>
                        setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                    }
                    className="absolute inset-0 h-full w-full object-contain object-center"
                />

                {/* touch point ring */}
                {lens && (
                    <span
                        className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_#0b0b0f]"
                        style={{ left: lens.x, top: lens.y }}
                    />
                )}

                {/* hint */}
                {!lens && (
                    <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[#0b0b0f]/75 px-2 py-1 text-[11px] font-bold text-white">
                        <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                        Hold &amp; drag
                    </span>
                )}
            </div>

            {/* zoom window (outside the overflow-hidden frame so it can extend past it) */}
            {lens && (
                <div
                    className="pointer-events-none absolute z-30 rounded-md border-[3px] border-[#0b0b0f] bg-[#f3ece2] shadow-[0_6px_0_rgba(11,11,15,0.25)]"
                    style={{
                        width: lensSize,
                        height: lensSize,
                        left: lensLeft,
                        top: lensTop,
                        backgroundImage: `url("${src}")`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${lens.dw * zoom}px ${lens.dh * zoom}px`,
                        backgroundPosition: `${lensSize / 2 - lens.rx * lens.dw * zoom}px ${lensSize / 2 - lens.ry * lens.dh * zoom
                            }px`,
                    }}
                />
            )}
        </div>
    );
}