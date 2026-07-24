export const villageLayouts: Record<string, Array<{ x: string; y: string }>> = {
  "salt-village": [
    { x: "55%", y: "87%" },
    { x: "45%", y: "74%" },
    { x: "66%", y: "64%" },
    { x: "72%", y: "48%" },
    { x: "55%", y: "38%" },
    { x: "55%", y: "33%" },
    { x: "60%", y: "26%" },
  ],
  // [
  //   { x: "48%", y: "94%" }, // stage 0 — gate, bottom (START)
  //   { x: "62%", y: "74%" },
  //   { x: "45%", y: "68%" },
  //   { x: "58%", y: "58%" },
  //   { x: "35%", y: "52%" },
  //   { x: "60%", y: "46%" },
  //   { x: "42%", y: "40%" },
  //   { x: "55%", y: "34%" },
  //   { x: "38%", y: "30%" }, // windmill
  //   { x: "62%", y: "24%" },
  //   { x: "55%", y: "18%" },
  //   { x: "68%", y: "13%" },
  //   { x: "58%", y: "6%" },  // temple, top (final stage)
  // ],
};

export function getNodePosition(theme: string, stageIndex: number) {
  const coords = villageLayouts[theme]?.[stageIndex];
  return coords ?? { x: "50%", y: `${(stageIndex + 1) * 8}%` }; // fallback so unmapped stages don't crash
}