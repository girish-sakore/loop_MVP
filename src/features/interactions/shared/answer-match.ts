export function canon(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|a|an)\s+/, "");
}

// Damerau-Levenshtein (optimal string alignment): a swapped pair like "teh" counts as 1 edit.
function distance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

// Short words must be exact ("Shank" vs "Shark"); longer ones get 1-2 typos.
function allowedTypos(len: number): number {
  if (len <= 5) return 0;
  if (len <= 10) return 1;
  return 2;
}

export function matchesAnswer(
  candidates: string[],
  value: string,
  opts: { fuzzy?: boolean } = {},
): boolean {
  const squash = (s: string) => canon(s).replace(/\s+/g, ""); // "waterlilies" == "water lilies"
  const u = squash(value);
  if (!u) return false;
  return candidates.some((c) => {
    const target = squash(c);
    if (target === u) return true;
    if (!opts.fuzzy) return false;
    return distance(target, u) <= allowedTypos(target.length);
  });
}