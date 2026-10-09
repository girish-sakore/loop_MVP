export interface Palette {
  teal: string; dteal: string; red: string; dred: string; yel: string; lyel: string;
  cream: string; dcream: string; ink: string; sky: string; blue: string; green: string;
  onbg: string; onbg2: string;
  /** colours for the 11 game types, in order */
  t: string[];
}

export const PALETTES: Record<string, Palette> = {
  "Teal": {
    "teal": "#17525e",
    "dteal": "#0e353d",
    "red": "#e04a35",
    "dred": "#a83223",
    "yel": "#f0b73a",
    "lyel": "#f6cd6c",
    "cream": "#f6efe0",
    "dcream": "#e8dcc2",
    "ink": "#162126",
    "sky": "#c6e4e4",
    "blue": "#2f7fb0",
    "green": "#2f8a57",
    "onbg": "#f6efe0",
    "onbg2": "#f6cd6c",
    "t": [
      "#e04a35",
      "#f0b73a",
      "#2f7fb0",
      "#2f8a57",
      "#17525e",
      "#a83223",
      "#6a5a94",
      "#f6cd6c",
      "#4aa083",
      "#162126",
      "#86643f"
    ]
  },
  "Paper": {
    "teal": "#efe8da",
    "dteal": "#e2d9c6",
    "red": "#e5532d",
    "dred": "#b03a1c",
    "yel": "#f4b73f",
    "lyel": "#f8d577",
    "cream": "#fffaf0",
    "dcream": "#f1e8d6",
    "ink": "#1c1a17",
    "sky": "#d6ebf0",
    "blue": "#2f7fb0",
    "green": "#2f8a57",
    "onbg": "#1c1a17",
    "onbg2": "#b0471f",
    "t": [
      "#e5532d",
      "#f4b73f",
      "#2f7fb0",
      "#2f8a57",
      "#17525e",
      "#b03a1c",
      "#6a5a94",
      "#f8d577",
      "#4aa083",
      "#1c1a17",
      "#86643f"
    ]
  },
  "Lagoon": {
    "teal": "#0f4c63",
    "dteal": "#0a3647",
    "red": "#2088ab",
    "dred": "#14607e",
    "yel": "#ffd75a",
    "lyel": "#fbe49a",
    "cream": "#fffbef",
    "dcream": "#f6ebc4",
    "ink": "#0d3445",
    "sky": "#c4eef6",
    "blue": "#3fbcd8",
    "green": "#2fa58a",
    "onbg": "#fffbef",
    "onbg2": "#fbe49a",
    "t": [
      "#2088ab",
      "#ffd75a",
      "#3fbcd8",
      "#2fa58a",
      "#0f4c63",
      "#14607e",
      "#7c6bd0",
      "#fbe49a",
      "#6cc6a6",
      "#0d3445",
      "#9a7a4a"
    ]
  },
  "Burgundy": {
    "teal": "#561a1a",
    "dteal": "#3d1013",
    "red": "#85293a",
    "dred": "#5f1c29",
    "yel": "#dcc3ac",
    "lyel": "#f2e2d2",
    "cream": "#f6ebde",
    "dcream": "#e9d6c3",
    "ink": "#2b0d10",
    "sky": "#e8d3c3",
    "blue": "#a94a5e",
    "green": "#6f8a64",
    "onbg": "#f2e2d2",
    "onbg2": "#dcc3ac",
    "t": [
      "#85293a",
      "#dcc3ac",
      "#b0586b",
      "#6f8a64",
      "#7a4a3a",
      "#561a1a",
      "#9a6b8a",
      "#f2e2d2",
      "#8fa57a",
      "#2b0d10",
      "#b08a64"
    ]
  },
  "Berry": {
    "teal": "#72213a",
    "dteal": "#561628",
    "red": "#b0364b",
    "dred": "#8a2338",
    "yel": "#d7e6b9",
    "lyel": "#e8f0cf",
    "cream": "#f8f3e6",
    "dcream": "#e6ecd0",
    "ink": "#2e0f1b",
    "sky": "#cfe9e2",
    "blue": "#4f9aa6",
    "green": "#72b8ab",
    "onbg": "#f8f3e6",
    "onbg2": "#d7e6b9",
    "t": [
      "#b0364b",
      "#d7e6b9",
      "#72b8ab",
      "#5fa38f",
      "#4f9aa6",
      "#8a2338",
      "#9a6b9a",
      "#e8f0cf",
      "#8fc4a0",
      "#2e0f1b",
      "#a88a64"
    ]
  },
  "Cocoa": {
    "teal": "#583a28",
    "dteal": "#412b1d",
    "red": "#8b6043",
    "dred": "#6b4630",
    "yel": "#ccd680",
    "lyel": "#e2e8a8",
    "cream": "#f7ead4",
    "dcream": "#ecd9bb",
    "ink": "#2b1c12",
    "sky": "#e8dcc0",
    "blue": "#a67c61",
    "green": "#8a9a4a",
    "onbg": "#f4e3c8",
    "onbg2": "#ccd680",
    "t": [
      "#8b6043",
      "#ccd680",
      "#a67c61",
      "#8a9a4a",
      "#6e4a33",
      "#6b4630",
      "#8a6a8a",
      "#e2e8a8",
      "#a9b86a",
      "#2b1c12",
      "#c09a70"
    ]
  },
  "Orchid": {
    "teal": "#4f2d4d",
    "dteal": "#3a2038",
    "red": "#774575",
    "dred": "#5a3158",
    "yel": "#efe8b9",
    "lyel": "#f6f1d2",
    "cream": "#f8f4de",
    "dcream": "#e9e6c4",
    "ink": "#2b1630",
    "sky": "#d3ece4",
    "blue": "#84c4b0",
    "green": "#aacda3",
    "onbg": "#f8f4de",
    "onbg2": "#efe8b9",
    "t": [
      "#774575",
      "#efe8b9",
      "#84c4b0",
      "#aacda3",
      "#4f2d4d",
      "#5a3158",
      "#9a6a98",
      "#f6f1d2",
      "#7fb09a",
      "#2b1630",
      "#a68a6a"
    ]
  },
  "Harbor": {
    "teal": "#243a53",
    "dteal": "#18283b",
    "red": "#577893",
    "dred": "#3f5c75",
    "yel": "#98b6c5",
    "lyel": "#c3d6df",
    "cream": "#f4eee2",
    "dcream": "#e9e0d0",
    "ink": "#16263a",
    "sky": "#cfe0e8",
    "blue": "#98b6c5",
    "green": "#5f9a8a",
    "onbg": "#f4eee2",
    "onbg2": "#98b6c5",
    "t": [
      "#577893",
      "#98b6c5",
      "#7a9bb5",
      "#5f9a8a",
      "#243a53",
      "#3f5c75",
      "#7a72a8",
      "#c3d6df",
      "#86b3a0",
      "#16263a",
      "#a89678"
    ]
  },
  "Signal": {
    "teal": "#141414",
    "dteal": "#0a0a0a",
    "red": "#dc3c1e",
    "dred": "#a82a12",
    "yel": "#ffe791",
    "lyel": "#fff0b8",
    "cream": "#fff6d6",
    "dcream": "#f3e6b0",
    "ink": "#111111",
    "sky": "#e2edc9",
    "blue": "#8fb35b",
    "green": "#8fb35b",
    "onbg": "#fff6d6",
    "onbg2": "#ffe791",
    "t": [
      "#dc3c1e",
      "#ffe791",
      "#8fb35b",
      "#6b8f3f",
      "#2b2b2b",
      "#a82a12",
      "#c9a227",
      "#fff0b8",
      "#a9c97a",
      "#111111",
      "#8a6a3a"
    ]
  },
  "Frost": {
    "teal": "#f4f4f4",
    "dteal": "#dfeff0",
    "red": "#f5441f",
    "dred": "#c4300f",
    "yel": "#b9d4da",
    "lyel": "#ffb199",
    "cream": "#fbfdfd",
    "dcream": "#dfeff0",
    "ink": "#16282e",
    "sky": "#e9f5f5",
    "blue": "#6f9ca8",
    "green": "#5aa59b",
    "onbg": "#16282e",
    "onbg2": "#d6381a",
    "t": [
      "#f5441f",
      "#b9d4da",
      "#6f9ca8",
      "#5aa59b",
      "#2f6f80",
      "#c4300f",
      "#7a72b0",
      "#ffb199",
      "#86bfae",
      "#16282e",
      "#a68a6a"
    ]
  },
  "Tide": {
    "teal": "#2e6a7d",
    "dteal": "#215263",
    "red": "#dc3c1e",
    "dred": "#a82d14",
    "yel": "#8cc5c2",
    "lyel": "#b9ddda",
    "cream": "#fff6f4",
    "dcream": "#e6f1ef",
    "ink": "#10303a",
    "sky": "#cde8e6",
    "blue": "#8cc5c2",
    "green": "#5fa9a4",
    "onbg": "#fff5f5",
    "onbg2": "#8cc5c2",
    "t": [
      "#dc3c1e",
      "#8cc5c2",
      "#2e6a7d",
      "#5fa9a4",
      "#215263",
      "#a82d14",
      "#8a7ab0",
      "#b9ddda",
      "#7bb89a",
      "#10303a",
      "#b08a64"
    ]
  }
};

export const DEFAULT_THEME = 'Harbor';
export const THEME_STORAGE_KEY = 'loop-theme';

export const VAR_KEYS = ['teal','dteal','red','dred','yel','lyel','cream','dcream','ink','sky','blue','green','onbg','onbg2'] as const;

export function saveTheme(key: string) {
  try { localStorage.setItem(THEME_STORAGE_KEY, key); } catch { /* ignore */ }
}

export function loadTheme(): string {
  try { const k = localStorage.getItem(THEME_STORAGE_KEY); return k && PALETTES[k] ? k : DEFAULT_THEME; } catch { return DEFAULT_THEME; }
}

export function applyPalette(p: Palette) {
  const r = document.documentElement.style;
  VAR_KEYS.forEach((k) => r.setProperty('--mb-' + k, p[k]));
  r.setProperty('--mb-sh', `color-mix(in srgb,${p.ink} 85%,transparent)`);
  typeColors(p).forEach((c, i) => { r.setProperty(`--mb-t${i}`, c.bg); r.setProperty(`--mb-tf${i}`, c.fg); });
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', p.teal);
}

function lum(h: string) {
  const n = parseInt(h.slice(1), 16);
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}

/** background + foreground colour for each game type under a palette */
export function typeColors(p: Palette) {
  return p.t.map((bg) => ({ bg, fg: lum(bg) > 0.35 ? p.ink : p.cream }));
}

/** Inline script that sets the saved theme before first paint (no flash). */
export function themeInitScript() {
  return `(function(){try{var P=${JSON.stringify(Object.fromEntries(Object.entries(PALETTES).map(([k, p]) => [k, p])))};var k=localStorage.getItem('${THEME_STORAGE_KEY}');var p=P[k]||P['${DEFAULT_THEME}'];var r=document.documentElement.style;${JSON.stringify(VAR_KEYS)}.forEach(function(x){r.setProperty('--mb-'+x,p[x])});r.setProperty('--mb-sh','color-mix(in srgb,'+p.ink+' 85%,transparent)');var L=function(h){var n=parseInt(h.slice(1),16),f=function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(n>>16)+.7152*f(n>>8&255)+.0722*f(n&255)};p.t.forEach(function(c,i){r.setProperty('--mb-t'+i,c);r.setProperty('--mb-tf'+i,L(c)>.35?p.ink:p.cream)})}catch(e){}})();`;
}
