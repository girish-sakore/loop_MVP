export type MatchResult =
  | { result: "correct" }
  | { result: "close"; kind: "typo" | "partial" }
  | { result: "wrong" };

type Blank = { answer: string; accept?: string[] };

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")          // accents
    .toLowerCase()
    .replace(/['’]/g, "")            // Islam's -> islams
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(the|a|an)\s+/, "");  // leading article
}

const squash = (s: string) => s.replace(/\s/g, "");

function distance(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

const maxEdits = (len: number) => (len <= 4 ? 0 : len <= 8 ? 1 : 2);

export function matchAnswer(input: string, blank: Blank): MatchResult {
  const user = normalize(input);
  if (!user) return { result: "wrong" };

  const targets = [blank.answer, ...(blank.accept ?? [])].map(normalize);

  // Exact (also ignoring spaces: "Prithvi Raj" == "Prithviraj")
  if (targets.some((t) => t === user || squash(t) === squash(user))) {
    return { result: "correct" };
  }

  // Typo: edit distance on the space-free form
  const u = squash(user);
  if (targets.some((t) => {
    const s = squash(t);
    return distance(u, s) <= maxEdits(s.length);
  })) {
    return { result: "close", kind: "typo" };
  }

  // Partial: some words of the main answer present, not all
  const answerWords = targets[0].split(" ");
  if (answerWords.length > 1) {
    const userWords = user.split(" ");
    const hit = answerWords.filter((w) =>
      userWords.some((x) => distance(x, w) <= maxEdits(w.length)),
    ).length;
    if (hit > 0 && hit < answerWords.length) return { result: "close", kind: "partial" };
  }

  return { result: "wrong" };
}