"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, PALETTES, applyPalette, loadTheme, saveTheme } from "@/lib/matchbox/palettes";

export default function ThemePicker() {
  const [current, setCurrent] = useState(DEFAULT_THEME);

  useEffect(() => {
    const k = loadTheme();
    setCurrent(k);
    applyPalette(PALETTES[k]);
  }, []);

  function pick(k: string) {
    setCurrent(k);
    applyPalette(PALETTES[k]);
    saveTheme(k);
  }

  return (
    <div className="themes" id="themes">
      {Object.entries(PALETTES).map(([k, p]) => (
        <button
          key={k}
          title={k}
          aria-label={`${k} theme`}
          aria-pressed={k === current}
          onClick={() => pick(k)}
          style={{ background: `linear-gradient(135deg,${p.teal} 50%,${p.red} 50%)` }}
        />
      ))}
      <em>THEME</em>
    </div>
  );
}
