import { useId, type ReactElement } from "react";
import { categoryKey, type CategoryKey } from "@/components/edition-intro/category-key";

type HeroIllustrationProps = {
  category?: string;
};

/* ───────────── Tokens & helpers ───────────── */

const INK = "var(--feature-ink)";
const PAPER = "var(--feature-paper)";
const ACCENT = "var(--feature-accent)";
const CONTRAST = "var(--feature-contrast)";
const R1 = "var(--feature-ray-1)";
const R2 = "var(--feature-ray-2)";

const o = { stroke: INK, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Four-point sparkle. */
function Sparkle({ x, y, s = 1, fill = R1 }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      d="M0-10 3-3 10 0 3 3 0 10-3 3-10 0-3-3Z"
      transform={`translate(${x} ${y}) scale(${s})`}
      fill={fill}
      {...o}
      strokeWidth="2.5"
    />
  );
}

/** Cloud drawn as one merged silhouette (outline pass + fill pass). */
function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const shapes = (
    <>
      <rect x="0" y="14" width="56" height="16" rx="8" />
      <circle cx="18" cy="14" r="11" />
      <circle cx="36" cy="10" r="14" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g fill={INK} stroke={INK} strokeWidth="8" strokeLinejoin="round">{shapes}</g>
      <g fill={PAPER}>{shapes}</g>
    </g>
  );
}

/* Sunburst backdrop shared by every illustration */
const BURST = Array.from({ length: 14 }, (_, i) => {
  const a1 = (i * 2 * Math.PI) / 14;
  const a2 = a1 + Math.PI / 14;
  const p = (a: number) => `${(120 + 140 * Math.cos(a)).toFixed(1)} ${(98 + 140 * Math.sin(a)).toFixed(1)}`;
  return `M120 98L${p(a1)}L${p(a2)}Z`;
}).join("");

function Backdrop() {
  return (
    <>
      <path d={BURST} fill={R2} opacity=".42" />
      <circle cx="30" cy="70" r="4" fill={R1} />
      <circle cx="214" cy="58" r="3.5" fill={R1} />
      <circle cx="208" cy="132" r="4" fill={R1} />
      <circle cx="24" cy="128" r="3" fill={R1} />
      <path d="M206 84v8m-4-4h8M36 100v8m-4-4h8" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity=".3" />
    </>
  );
}

/* ───────────── Geography ───────────── */
function GeographyArt() {
  return (
    <>
      <circle cx="127" cy="99" r="58" fill={INK} opacity=".18" />
      <path d="M54 92a66 66 0 0 0 132 0" fill="none" {...o} strokeWidth="5" />
      <path d="M120 158v9" {...o} strokeWidth="5" />
      <path d="M92 167h56l5 9H87Z" fill={R1} {...o} strokeWidth="4" />
      <circle cx="54" cy="92" r="5" fill={R1} {...o} strokeWidth="3" />
      <circle cx="186" cy="92" r="5" fill={R1} {...o} strokeWidth="3" />
      <circle cx="120" cy="92" r="58" fill={ACCENT} />
      <path
        d="M62 92h116M120 34c-22 16-32 38-32 58s10 42 32 58m0-116c22 16 32 38 32 58s-10 42-32 58M74 62c28 10 64 10 92 0M74 122c28-10 64-10 92 0"
        fill="none"
        stroke="#fff"
        strokeOpacity=".35"
        strokeWidth="2.5"
      />
      <path d="M86 70c8-10 22-12 30-4l2 10-8 8 6 10-10 8-12-8-8-12Z" fill={PAPER} {...o} strokeWidth="3" />
      <path d="M132 96c10-6 22-2 26 8l-4 16-14 10-10-12Z" fill={PAPER} {...o} strokeWidth="3" />
      <path d="M92 118c8-2 14 2 14 8l-8 6-8-6Z" fill={PAPER} {...o} strokeWidth="3" />
      <circle cx="120" cy="92" r="58" fill="none" {...o} strokeWidth="4.5" />
      <path d="M78 62c6-12 18-20 32-24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".6" />
      <path d="M150 46c-9 0-15 7-15 15 0 12 15 27 15 27s15-15 15-27c0-8-6-15-15-15Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
      <circle cx="150" cy="61" r="5.5" fill={PAPER} {...o} strokeWidth="2.5" />
      <Sparkle x={40} y={44} s={1.1} />
    </>
  );
}

/* ───────────── History (hourglass) ───────────── */
function HistoryArt() {
  const glass = "M76 40h88c0 34-22 46-38 55 16 9 38 21 38 55H76c0-34 22-46 38-55-16-9-38-21-38-55Z";
  return (
    <>
      <path d={glass} transform="translate(6 6)" fill={INK} opacity=".18" />
      <rect x="68" y="40" width="8" height="110" fill={ACCENT} {...o} strokeWidth="3" />
      <rect x="164" y="40" width="8" height="110" fill={ACCENT} {...o} strokeWidth="3" />
      <path d={glass} fill={PAPER} />
      <path d="M84 48h72c-2 20-14 30-28 40h-16c-14-10-26-20-28-40Z" fill={R1} {...o} strokeWidth="3" />
      <path d="M120 90v38" stroke={R1} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M84 150c4-16 18-24 36-34 18 10 32 18 36 34Z" fill={R1} {...o} strokeWidth="3" />
      <circle cx="120" cy="136" r="2" fill={INK} opacity=".5" />
      <path d={glass} fill="none" {...o} strokeWidth="4.5" />
      <path d="M86 52c0 18 8 28 18 36" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".75" />
      <rect x="56" y="26" width="128" height="16" rx="4" fill={ACCENT} {...o} strokeWidth="4" />
      <rect x="56" y="150" width="128" height="16" rx="4" fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M66 34h108M66 158h108" stroke={CONTRAST} strokeWidth="3" strokeLinecap="round" />
      <Sparkle x={202} y={50} />
      <Sparkle x={36} y={140} s={0.8} />
    </>
  );
}

/* ───────────── Food (pizza slice) ───────────── */
function FoodArt() {
  const cheese = "M54 74c22-8 110-8 132 0L120 168Z";
  return (
    <>
      <g transform="rotate(-6 120 100)">
        <path d={cheese} transform="translate(6 6)" fill={INK} opacity=".18" />
        <path d={cheese} fill={R1} {...o} strokeWidth="4" />
        <path d="M44 50c30-14 122-14 152 0l-10 24c-22-9-110-9-132 0Z" fill={R2} {...o} strokeWidth="4" />
        <circle cx="68" cy="58" r="2.5" fill={INK} opacity=".35" />
        <circle cx="100" cy="55" r="2.5" fill={INK} opacity=".35" />
        <circle cx="140" cy="55" r="2.5" fill={INK} opacity=".35" />
        <circle cx="172" cy="58" r="2.5" fill={INK} opacity=".35" />
        <path d="M60 52c20-8 50-10 72-9" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".55" />
        {[
          [96, 98],
          [142, 102],
          [118, 134],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="14" fill={ACCENT} {...o} strokeWidth="3.5" />
            <circle cx={x - 4} cy={y - 3} r="2" fill={INK} opacity=".35" />
            <circle cx={x + 5} cy={y + 2} r="2" fill={INK} opacity=".35" />
            <circle cx={x - 1} cy={y + 6} r="1.6" fill={INK} opacity=".35" />
            <path d={`M${x - 8} ${y - 6}c2-3 5-5 8-5`} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
          </g>
        ))}
        <circle cx="74" cy="88" r="3.5" fill={R2} opacity=".9" />
        <circle cx="166" cy="88" r="3" fill={R2} opacity=".9" />
      </g>
      <path d="M172 136c8-14 24-14 30-8-2 14-16 24-30 8Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
      <path d="M174 134c8-2 16-4 24-6" fill="none" {...o} strokeWidth="2" />
      <Sparkle x={42} y={44} />
    </>
  );
}

/* ───────────── Literature ───────────── */
function LiteratureArt() {
  return (
    <>
      <path d="M26 70c30-12 64-12 94 4 30-16 64-16 94-4v98c-30-10-64-10-94 6-30-16-64-16-94-6Z" transform="translate(5 5)" fill={INK} opacity=".18" />
      <path d="M26 70c30-12 64-12 94 4 30-16 64-16 94-4v98c-30-10-64-10-94 6-30-16-64-16-94-6Z" fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M120 66c-26-14-58-14-84-4v94c26-10 58-10 84 4Z" fill={PAPER} {...o} strokeWidth="3.5" />
      <path d="M120 66c26-14 58-14 84-4v94c-26-10-58-10-84 4Z" fill={PAPER} {...o} strokeWidth="3.5" />
      <path d="M48 80c18-4 36-3 54 3M48 94c18-4 36-3 54 3M48 108c18-4 36-3 54 3M48 122c18-4 36-3 54 3" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <circle cx="176" cy="104" r="11" fill={R1} {...o} strokeWidth="3" />
      <path d="M138 146l22-22 14 12 10-8 14 18Z" fill={R2} {...o} strokeWidth="3" />
      <path d="M114 64v100l6-8 6 8V64Z" fill={CONTRAST} {...o} strokeWidth="3" />
      <path d="M200 18c-34 2-62 20-72 54 30-4 58-22 72-54Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
      <path d="M198 20 132 84" fill="none" {...o} strokeWidth="3.5" />
      <path d="M178 34l-14 4m6 8-14 4m-6 10-12 4" fill="none" {...o} strokeWidth="2.5" />
      <path d="M132 84l-6 10 10-4Z" fill={INK} {...o} strokeWidth="2" />
      <Sparkle x={34} y={40} />
    </>
  );
}

/* ───────────── Music (vinyl) ───────────── */
function MusicArt() {
  return (
    <>
      <circle cx="122" cy="106" r="58" fill={INK} opacity=".18" />
      <circle cx="116" cy="100" r="58" fill={INK} stroke={INK} strokeWidth="4" />
      <circle cx="116" cy="100" r="50" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
      <circle cx="116" cy="100" r="42" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
      <circle cx="116" cy="100" r="34" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
      <path d="M116 100 150 52A58 58 0 0 1 172 78Z" fill="#fff" opacity=".12" />
      <path d="M116 100 82 148A58 58 0 0 1 60 122Z" fill="#fff" opacity=".12" />
      <circle cx="116" cy="100" r="22" fill={ACCENT} {...o} strokeWidth="3" stroke="#fff" />
      <circle cx="116" cy="100" r="11" fill={R1} stroke={INK} strokeWidth="2.5" />
      <circle cx="116" cy="100" r="3" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      <path d="M200 40 190 70 168 112" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M200 40 190 70 168 112" fill="none" stroke={R2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="200" cy="40" r="12" fill={R2} {...o} strokeWidth="3.5" />
      <circle cx="200" cy="40" r="4" fill={INK} />
      <g transform="rotate(28 168 112)">
        <rect x="160" y="108" width="16" height="22" rx="3" fill={CONTRAST} {...o} strokeWidth="3" />
      </g>
      <ellipse cx="36" cy="68" rx="9" ry="6.5" transform="rotate(-20 36 68)" fill={R1} {...o} strokeWidth="3" />
      <path d="M44 66V34c10 2 16 8 14 18" fill="none" {...o} strokeWidth="3.5" />
      <ellipse cx="204" cy="154" rx="8.5" ry="6" transform="rotate(-20 204 154)" fill={R1} {...o} strokeWidth="3" />
      <path d="M212 152V124c9 2 14 7 12 16" fill="none" {...o} strokeWidth="3.5" />
      <Sparkle x={214} y={96} s={0.8} />
    </>
  );
}

/* ───────────── Mythology (laurel wreath + bolt) ───────────── */
function Laurel() {
  const angles = [100, 120, 140, 160, 180, 200, 220, 240];
  return (
    <>
      <path d="M109 161A64 64 0 0 1 88 43" fill="none" {...o} strokeWidth="4" />
      {angles.map((a) => {
        const r = (a * Math.PI) / 180;
        const x = 120 + 64 * Math.cos(r);
        const y = 98 + 64 * Math.sin(r);
        return (
          <g key={a}>
            <ellipse cx={x - 7} cy={y} rx="6" ry="13" transform={`rotate(${a - 30} ${x - 7} ${y})`} fill={CONTRAST} {...o} strokeWidth="2.5" />
            <ellipse cx={x + 6} cy={y + 2} rx="5" ry="10" transform={`rotate(${a + 35} ${x + 6} ${y + 2})`} fill={R2} {...o} strokeWidth="2.5" />
          </g>
        );
      })}
    </>
  );
}

function MythologyArt() {
  return (
    <>
      <circle cx="126" cy="104" r="46" fill={INK} opacity=".18" />
      <Laurel />
      <g transform="translate(240 0) scale(-1 1)">
        <Laurel />
      </g>
      <circle cx="120" cy="98" r="46" fill={R1} {...o} strokeWidth="4" />
      <circle cx="120" cy="98" r="38" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      <g transform="translate(120 98) scale(.85) translate(-120 -98)">
        <path d="M132 56 96 106h22l-12 36 38-52h-24Z" fill={ACCENT} {...o} strokeWidth="4" />
      </g>
      <path d="M88 80c4-10 10-16 18-20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <path d="M114 166l6 8 6-8-6-5Z" fill={ACCENT} {...o} strokeWidth="3" />
      <Sparkle x={36} y={40} />
      <Sparkle x={206} y={44} s={0.8} />
    </>
  );
}

/* ───────────── Sports (trophy) ───────────── */
function SportsArt() {
  const cup = "M80 34h80c0 36-8 62-40 68-32-6-40-32-40-68Z";
  return (
    <>
      <path d={cup} transform="translate(6 6)" fill={INK} opacity=".18" />
      <path d="M80 46c-28-4-34 28-6 38 4 1 8 2 12 2" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
      <path d="M80 46c-28-4-34 28-6 38 4 1 8 2 12 2" fill="none" stroke={R1} strokeWidth="5" strokeLinecap="round" />
      <path d="M160 46c28-4 34 28 6 38-4 1-8 2-12 2" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" />
      <path d="M160 46c28-4 34 28 6 38-4 1-8 2-12 2" fill="none" stroke={R1} strokeWidth="5" strokeLinecap="round" />
      <rect x="110" y="100" width="20" height="24" fill={R1} {...o} strokeWidth="3.5" />
      <path d={cup} fill={R1} {...o} strokeWidth="4" />
      <path d="M92 44c0 22 6 34 16 44" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" opacity=".65" />
      <polygon points="120,48 123.8,58.7 135.2,59.1 126.2,66 129.4,76.9 120,70.5 110.6,76.9 113.8,66 104.8,59.1 116.2,58.7" fill={PAPER} {...o} strokeWidth="3" />
      <path d="M96 122h48l6 20H90Z" fill={ACCENT} {...o} strokeWidth="3.5" />
      <rect x="80" y="142" width="80" height="26" rx="3" fill={ACCENT} {...o} strokeWidth="4" />
      <rect x="102" y="150" width="36" height="10" rx="2" fill={PAPER} {...o} strokeWidth="2.5" />
      <g transform="rotate(20 44 46)"><rect x="40" y="42" width="9" height="9" fill={CONTRAST} {...o} strokeWidth="2" /></g>
      <circle cx="202" cy="40" r="5" fill={ACCENT} {...o} strokeWidth="2.5" />
      <circle cx="36" cy="112" r="4.5" fill={CONTRAST} {...o} strokeWidth="2.5" />
      <g transform="rotate(-25 206 116)"><rect x="202" y="112" width="9" height="9" fill={R2} {...o} strokeWidth="2" /></g>
      <path d="M26 80l7 9-10 2Z" fill={ACCENT} {...o} strokeWidth="2" />
    </>
  );
}

/* ───────────── Science & Technology (atom) ───────────── */
function ScienceArt() {
  return (
    <>
      <circle cx="120" cy="92" r="34" fill={PAPER} opacity=".7" />
      {[0, 60, 120].map((r) => (
        <ellipse key={r} cx="120" cy="92" rx="72" ry="26" transform={`rotate(${r} 120 92)`} fill="none" stroke={INK} strokeWidth="4.5" />
      ))}
      <g><circle cx="175.2" cy="108.7" r="7.5" fill={CONTRAST} {...o} strokeWidth="3" /></g>
      <g transform="rotate(60 120 92)"><circle cx="64.8" cy="75.3" r="7.5" fill={CONTRAST} {...o} strokeWidth="3" /></g>
      <g transform="rotate(120 120 92)"><circle cx="73.7" cy="111.9" r="7.5" fill={CONTRAST} {...o} strokeWidth="3" /></g>
      <circle cx="120" cy="92" r="17" fill={ACCENT} {...o} strokeWidth="4" />
      <circle cx="113" cy="85" r="5" fill="#fff" opacity=".7" />
      <circle cx="128" cy="98" r="3" fill={R1} {...o} strokeWidth="2" />
      <circle cx="200" cy="148" r="15" fill="none" stroke={INK} strokeWidth="9" strokeDasharray="6 5.78" />
      <circle cx="200" cy="148" r="13" fill={R1} {...o} strokeWidth="3.5" />
      <circle cx="200" cy="148" r="5" fill={PAPER} {...o} strokeWidth="2.5" />
      <path d="M34 134v5m8-5v5m8-5v5M34 165v5m8-5v5m8-5v5M24 144h5m-5 8h5m-5 8h5M55 144h5m-5 8h5m-5 8h5" fill="none" {...o} strokeWidth="3" />
      <rect x="29" y="139" width="26" height="26" rx="3" fill={PAPER} {...o} strokeWidth="3.5" />
      <rect x="35" y="145" width="14" height="14" rx="2" fill={R1} {...o} strokeWidth="2.5" />
    </>
  );
}

/* ───────────── Travel (hot-air balloon) ───────────── */
function TravelArt() {
  const envelope = "M120 20c-42 0-66 30-66 60 0 22 16 40 38 54h56c22-14 38-32 38-54 0-30-24-60-66-60Z";
  return (
    <>
      <Cloud x={6} y={118} />
      <Cloud x={178} y={140} s={0.8} />
      <path d={envelope} transform="translate(6 6)" fill={INK} opacity=".18" />
      <path d="M94 134l8 20m44-20-8 20" fill="none" {...o} strokeWidth="3" />
      <path d={envelope} fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M120 20c-20 16-28 64-22 114h44c6-50-2-98-22-114Z" fill={R1} {...o} strokeWidth="3.5" />
      <path d="M62 96c18 9 40 13 58 13s40-4 58-13l-3 13c-16 8-38 12-55 12s-39-4-55-12Z" fill={CONTRAST} {...o} strokeWidth="3" />
      <path d="M76 44c-8 8-14 18-16 28" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <rect x="97" y="150" width="46" height="8" rx="3" fill={R1} {...o} strokeWidth="3" />
      <rect x="100" y="156" width="40" height="18" rx="4" fill={R2} {...o} strokeWidth="3.5" />
      <path d="M110 157v16m10-16v16m10-16v16" fill="none" stroke={INK} strokeWidth="2" opacity=".4" />
      <path d="M120 20V10" {...o} strokeWidth="3" />
      <path d="M120 10l12 4-12 4Z" fill={CONTRAST} {...o} strokeWidth="2.5" />
      <Sparkle x={34} y={52} />
    </>
  );
}

/* ───────────── Art (palette + brush) ───────────── */
function ArtArt() {
  const body = "M118 30c50 0 82 26 82 60 0 28-22 38-42 34-16-3-22 10-14 22 7 12-4 24-26 24-52 0-86-30-86-70S66 30 118 30Z";
  return (
    <>
      <path d={body} transform="translate(6 6)" fill={INK} opacity=".18" />
      <path d={body} fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M60 70c8-16 22-26 40-30" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <circle cx="84" cy="118" r="10" fill="var(--feature-art)" {...o} strokeWidth="3.5" />
      {[
        [66, 72, CONTRAST],
        [106, 52, R1],
        [148, 58, R2],
        [180, 92, PAPER],
      ].map(([x, y, c]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x as number} cy={y as number} r="13" fill={c as string} {...o} strokeWidth="3.5" />
          <circle cx={(x as number) - 4} cy={(y as number) - 4} r="3" fill="#fff" opacity=".65" />
        </g>
      ))}
      <g transform="rotate(35 178 70)">
        <rect x="172" y="12" width="12" height="58" rx="6" fill={CONTRAST} {...o} strokeWidth="3.5" />
        <rect x="171" y="70" width="14" height="14" fill={PAPER} {...o} strokeWidth="3" />
        <path d="M171 84h14c1 14-3 24-7 32-4-8-8-18-7-32Z" fill={R1} {...o} strokeWidth="3.5" />
      </g>
      <Sparkle x={36} y={150} s={0.8} />
    </>
  );
}

/* ───────────── Business & Finance ───────────── */
function BusinessArt() {
  const bars: Array<[number, number, string]> = [
    [104, 46, ACCENT],
    [138, 72, R2],
    [172, 100, ACCENT],
  ];
  return (
    <>
      {[150, 139, 128, 117].map((y) => (
        <g key={y}>
          <path d={`M46 ${y}v11a22 8 0 0 0 44 0v-11`} fill={R1} {...o} strokeWidth="3.5" />
          <ellipse cx="68" cy={y} rx="22" ry="8" fill={R1} {...o} strokeWidth="3.5" />
          <ellipse cx="68" cy={y} rx="13" ry="4.5" fill="none" stroke={INK} strokeWidth="2" opacity=".5" />
        </g>
      ))}
      {bars.map(([x, h, c]) => (
        <g key={x}>
          <rect x={x + 5} y={170 - h + 5} width="28" height={h} fill={INK} opacity=".18" />
          <rect x={x} y={170 - h} width="28" height={h} fill={c} {...o} strokeWidth="4" />
          <rect x={x + 5} y={170 - h + 6} width="5" height={h - 14} fill="#fff" opacity=".28" />
        </g>
      ))}
      <path d="M96 100 128 72 152 86 196 38" fill="none" stroke={INK} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 100 128 72 152 86 196 38" fill="none" stroke={CONTRAST} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M180 30l28-2-2 28Z" fill={CONTRAST} {...o} strokeWidth="4" />
      <Sparkle x={40} y={64} />
    </>
  );
}

/* ───────────── Architecture (domed portico) ───────────── */
function ArchitectureArt() {
  const xs = [52, 82.5, 113, 143.5, 174];
  return (
    <>
      <rect x="40" y="82" width="160" height="94" transform="translate(6 6)" fill={INK} opacity=".14" />
      <path d="M80 62a40 40 0 0 1 80 0Z" fill={CONTRAST} {...o} strokeWidth="4" />
      <path d="M120 22v40M100 26c-6 10-8 22-6 36M140 26c6 10 8 22 6 36" fill="none" {...o} strokeWidth="2.5" />
      <rect x="114" y="10" width="12" height="12" fill={R1} {...o} strokeWidth="3" />
      <path d="M120 10V3" {...o} strokeWidth="3" />
      <path d="M40 74 120 44l80 30Z" fill={PAPER} {...o} strokeWidth="4" />
      <path d="M62 70 120 50l58 20" fill="none" stroke={INK} strokeWidth="2.5" opacity=".45" strokeLinecap="round" />
      <circle cx="120" cy="64" r="6" fill={R1} {...o} strokeWidth="3" />
      <rect x="46" y="74" width="148" height="12" fill={ACCENT} {...o} strokeWidth="4" />
      {xs.map((x) => (
        <g key={x}>
          <rect x={x} y="91" width="14" height="54" fill={PAPER} {...o} strokeWidth="3.5" />
          <path d={`M${x + 5} 94v48m4-48v48`} stroke={INK} strokeWidth="1.8" opacity=".35" />
          <rect x={x - 3} y="86" width="20" height="6" fill={ACCENT} {...o} strokeWidth="3" />
          <rect x={x - 3} y="145" width="20" height="6" fill={ACCENT} {...o} strokeWidth="3" />
        </g>
      ))}
      <rect x="40" y="151" width="160" height="10" fill={R2} {...o} strokeWidth="4" />
      <rect x="34" y="161" width="172" height="12" fill={R2} {...o} strokeWidth="4" />
      <Sparkle x={216} y={40} s={0.8} />
    </>
  );
}

/* ───────────── Fashion (dress on a hanger) ───────────── */
function FashionArt() {
  const dress = "M102 76h10l8 12 8-12h10l6 24c2 22 18 44 34 66H62c16-22 32-44 34-66Z";
  return (
    <>
      <path d={dress} transform="translate(6 6)" fill={INK} opacity=".18" />
      <path d="M120 44v-8a9 9 0 1 0-9-9" fill="none" {...o} strokeWidth="4" />
      <path d="M120 44 54 74h132Z" fill="none" {...o} strokeWidth="4" />
      <path d={dress} fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M104 80c-2 10-4 18-6 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity=".35" />
      <path d="M64 160c20 6 92 6 112 0" fill="none" stroke={R1} strokeWidth="3.5" strokeLinecap="round" />
      {[
        [96, 132],
        [124, 124],
        [148, 134],
        [110, 150],
        [138, 154],
        [84, 156],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={CONTRAST} />
      ))}
      <path d="M96 100h48v9H96Z" fill={CONTRAST} {...o} strokeWidth="3" />
      <path d="M120 104l-14-8v16Zm0 0 14-8v16Z" fill={CONTRAST} {...o} strokeWidth="2.5" />
      <circle cx="120" cy="104" r="3.5" fill={R1} {...o} strokeWidth="2" />
      <Sparkle x={196} y={44} />
      <Sparkle x={42} y={124} s={0.8} />
    </>
  );
}

/* ───────────── Culture (rangoli mandala) ───────────── */
function CultureArt() {
  const outer = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  const inner = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
  return (
    <>
      <circle cx="126" cy="104" r="64" fill={INK} opacity=".18" />
      {outer.map((a) => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={120 + 66 * Math.cos(r)} cy={98 + 66 * Math.sin(r)} r="8" fill={R1} {...o} strokeWidth="3" />;
      })}
      <circle cx="120" cy="98" r="64" fill={PAPER} {...o} strokeWidth="4" />
      {petals.map((a, i) => (
        <g key={a} transform={`rotate(${a} 120 98)`}>
          <ellipse cx="120" cy="60" rx="9" ry="21" fill={i % 2 ? R2 : ACCENT} {...o} strokeWidth="3" />
          <circle cx="120" cy="40" r="3" fill={INK} />
        </g>
      ))}
      {inner.map((a) => (
        <ellipse key={a} cx="120" cy="78" rx="7" ry="12" transform={`rotate(${a} 120 98)`} fill={CONTRAST} {...o} strokeWidth="2.5" />
      ))}
      <circle cx="120" cy="98" r="10" fill={R1} {...o} strokeWidth="3" />
      <circle cx="120" cy="98" r="4" fill={PAPER} {...o} strokeWidth="2" />
      <Sparkle x={30} y={36} />
      <Sparkle x={212} y={160} s={0.8} />
    </>
  );
}

/* ───────────── Entertainment (popcorn) ───────────── */
function EntertainmentArt() {
  const bucket = "M70 84l12 84h76l12-84Z";
  const puffs: Array<[number, number, number]> = [
    [112, 52, 17],
    [138, 58, 16],
    [88, 66, 15],
    [158, 70, 13],
    [100, 76, 12],
    [128, 76, 13],
  ];
  return (
    <>
      <path d={bucket} transform="translate(6 6)" fill={INK} opacity=".18" />
      {puffs.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={r} fill={PAPER} {...o} strokeWidth="3.5" />
          <circle cx={x + 4} cy={y + 3} r="4" fill={R1} />
          <path d={`M${x - r * 0.6} ${y - r * 0.2}c2-5 6-7 9-7`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".4" />
        </g>
      ))}
      <path d={bucket} fill={PAPER} />
      <path d="M70 84h25L101 168H82Z M120 84h25L139 168H120Z" fill={ACCENT} />
      <path d={bucket} fill="none" {...o} strokeWidth="4" />
      <path d="M95 84 101 168M120 84v84M145 84 139 168" stroke={INK} strokeWidth="2.5" opacity=".5" />
      <rect x="64" y="78" width="112" height="12" rx="4" fill={ACCENT} {...o} strokeWidth="4" />
      <path d="M76 100l6 60" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".4" />
      <Sparkle x={40} y={60} />
      <Sparkle x={200} y={50} s={0.8} />
    </>
  );
}

/* ───────────── Etymology (word with roots) ───────────── */
function EtymologyArt() {
  return (
    <>
      <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M120 124v20c0 12-6 18-8 28" />
        <path d="M120 128c-8 12-26 14-34 24-4 6-4 14-2 20" />
        <path d="M120 128c10 10 28 12 36 22 4 6 4 14 2 22" />
        <path d="M104 150c-8 2-14 6-18 12M138 148c8 2 14 6 18 12" strokeWidth="3.5" />
      </g>
      <path d="M120 28v-14" {...o} strokeWidth="4" />
      <path d="M120 18c-6-12-20-14-30-8 4 12 18 16 30 8Z" fill={ACCENT} {...o} strokeWidth="3" />
      <path d="M120 22c8-12 22-12 30-4-6 12-20 14-30 4Z" fill={R2} {...o} strokeWidth="3" />
      <rect x="72" y="28" width="96" height="96" rx="12" transform="translate(6 6)" fill={INK} opacity=".18" />
      <rect x="72" y="28" width="96" height="96" rx="12" fill={PAPER} {...o} strokeWidth="4" />
      <rect x="80" y="36" width="80" height="80" rx="8" fill="none" stroke={INK} strokeWidth="1.8" opacity=".3" />
      <path d="M96 104l24-56 24 56" fill="none" {...o} strokeWidth="7" />
      <path d="M105 86h30" fill="none" stroke={ACCENT} strokeWidth="7" strokeLinecap="round" />
      <circle cx="164" cy="104" r="28" fill={PAPER} fillOpacity=".45" {...o} strokeWidth="5" />
      <path d="M146 96c3-8 10-13 17-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M184 124l22 28" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
      <path d="M184 124l22 28" fill="none" stroke={CONTRAST} strokeWidth="7" strokeLinecap="round" />
      <Sparkle x={34} y={60} />
    </>
  );
}

/* ───────────── Nature (landscape) ───────────── */
function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="18" width="8" height="10" fill={INK} />
      <path d="M0-16-30 20h60Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
      <path d="M0-34-25 2h50Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
      <path d="M0-54-19-18h38Z" fill={CONTRAST} {...o} strokeWidth="3.5" />
    </g>
  );
}

function NatureArt() {
  return (
    <>
      <circle cx="180" cy="50" r="31" fill={R1} opacity=".4" />
      <circle cx="180" cy="50" r="22" fill={R1} {...o} strokeWidth="4" />
      <Cloud x={92} y={28} s={0.7} />
      <path d="M0 177V150L52 80L82 110L124 52L174 126L202 98L240 140V177Z" fill={R2} {...o} strokeWidth="4" />
      <path d="M124 52 106 82l10-4 8 8 8-8 10 4Z" fill={PAPER} {...o} strokeWidth="3" />
      <path d="M0 160c36-22 80-26 118-10 42 18 84 12 122-12v39H0Z" fill={ACCENT} {...o} strokeWidth="4" />
      <Pine x={58} y={146} />
      <Pine x={88} y={154} s={0.7} />
      <Pine x={182} y={150} s={0.85} />
      <path d="M36 44q7-9 14 0q7-9 14 0M64 26q5-7 10 0q5-7 10 0" fill="none" {...o} strokeWidth="3.5" />
    </>
  );
}

/* ───────────── Entry point ───────────── */

const ART: Record<CategoryKey, () => ReactElement> = {
  geography: GeographyArt,
  history: HistoryArt,
  food: FoodArt,
  literature: LiteratureArt,
  music: MusicArt,
  mythology: MythologyArt,
  sports: SportsArt,
  science: ScienceArt,
  travel: TravelArt,
  art: ArtArt,
  business: BusinessArt,
  architecture: ArchitectureArt,
  fashion: FashionArt,
  culture: CultureArt,
  entertainment: EntertainmentArt,
  etymology: EtymologyArt,
  nature: NatureArt,
};

export default function HeroIllustration({ category = "" }: HeroIllustrationProps) {
  const Art = ART[categoryKey(category)];
  const clipId = `hero-clip-${useId().replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 240 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect width="240" height="177" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <Backdrop />
      </g>
      <ellipse cx="120" cy="177" rx="74" ry="6" fill={INK} opacity=".16" />
      <Art />
      <path d="M0 177h240" stroke={INK} strokeWidth="4" />
    </svg>
  );
}