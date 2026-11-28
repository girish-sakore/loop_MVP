export type CategoryKey =
  | "geography"
  | "history"
  | "food"
  | "literature"
  | "music"
  | "mythology"
  | "sports"
  | "science"
  | "travel"
  | "art"
  | "business"
  | "architecture"
  | "fashion"
  | "culture"
  | "entertainment"
  | "etymology"
  | "nature";

// Order matters: first match wins ("architecture" must beat "art").
const RULES: Array<[CategoryKey, RegExp]> = [
  ["architecture", /architect/],
  ["art", /\barts?\b|paint|museum/],
  ["history", /histor/],
  ["literature", /literat|book|poet/],
  ["science", /science|tech/],
  ["food", /food|cuisine|drink|cook/],
  ["music", /music|song/],
  ["mythology", /myth|legend/],
  ["sports", /sport/],
  ["travel", /travel|tour|trip/],
  ["business", /business|financ|econom|money/],
  ["fashion", /fashion|style/],
  ["culture", /cultur/],
  ["entertainment", /entertain|movie|film|cinema|\btv\b/],
  ["etymology", /etym|ethm/],
  ["nature", /nature|wildlife|animal/],
  ["geography", /geograph|world|\bmap/],
];

/** Accepts labels ("Science n Technology"), slugs ("science-technology") and common typos. */
export function categoryKey(category?: string | null): CategoryKey {
  const normalized = (category ?? "").trim().toLowerCase().replace(/[_&-]+/g, " ");
  return RULES.find(([, re]) => re.test(normalized))?.[0] ?? "geography";
}