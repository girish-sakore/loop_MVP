import borders from "./borders.json";
import type { BorderHopStage } from "@/types/gameplay";

// Each border is stored once; gameplay always treats it as bidirectional.
export const adjacency: Record<string, string[]> = {};
for (const [country, neighbors] of Object.entries(borders)) {
  adjacency[country] ??= [];
  for (const neighbor of neighbors) {
    adjacency[neighbor] ??= [];
    if (!adjacency[country].includes(neighbor)) adjacency[country].push(neighbor);
    if (!adjacency[neighbor].includes(country)) adjacency[neighbor].push(country);
  }
}

export const countryAliases: Record<string, string> = {
  "United States of America": "United States", USA: "United States", US: "United States",
  UK: "United Kingdom", "Czech Republic": "Czechia", Macedonia: "North Macedonia",
  "Republic of Serbia": "Serbia", "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Central African Rep.": "Central African Republic", "Dem. Rep. Congo": "Democratic Republic of the Congo",
  DRC: "Democratic Republic of the Congo", Congo: "Republic of the Congo",
  "Dominican Rep.": "Dominican Republic", "Eq. Guinea": "Equatorial Guinea",
  "Côte d'Ivoire": "Ivory Coast", "Guinea Bissau": "Guinea-Bissau",
  "S. Sudan": "South Sudan", "W. Sahara": "Western Sahara",
  "United Republic of Tanzania": "Tanzania", Swaziland: "Eswatini", eSwatini: "Eswatini",
  "East Timor": "Timor-Leste", "The Bahamas": "Bahamas", "N. Cyprus": "Northern Cyprus",
};
const normalize = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function resolveCountry(raw: string, names = Object.keys(adjacency)): string | null {
  const query = normalize(raw);
  const alias = Object.entries(countryAliases).find(([key]) => normalize(key) === query)?.[1];
  return names.find((name) => normalize(name) === normalize(alias ?? raw)) ?? null;
}

export function shortestPath(start: string, target: string, blocked: readonly string[] = []): string[] | null {
  if (!adjacency[start] || !adjacency[target]) return null;
  const visited = new Set(blocked);
  visited.add(start);
  const queue: string[][] = [[start]];
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i];
    const current = path[path.length - 1];
    if (current === target) return path;
    for (const next of adjacency[current]) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}

export function validateRoute(stage: Pick<BorderHopStage, "startCountry" | "targetCountry" | "maxGuesses" | "hintsAllowed">) {
  if (typeof stage.startCountry !== "string" || typeof stage.targetCountry !== "string") {
    throw new Error("Border Hop requires startCountry and targetCountry.");
  }
  const start = resolveCountry(stage.startCountry);
  const target = resolveCountry(stage.targetCountry);
  if (!start || !target) throw new Error("Border Hop endpoints must be supported land-border countries.");
  const path = shortestPath(start, target);
  if (!path || path.length < 2) throw new Error("Border Hop requires different, connected endpoints.");
  const maxGuesses = stage.maxGuesses ?? path.length - 1 + 4;
  if (!Number.isInteger(maxGuesses) || maxGuesses < path.length - 1 || maxGuesses > 100) {
    throw new Error("Border Hop maxGuesses must cover the shortest route and be at most 100.");
  }
  const hintsAllowed = stage.hintsAllowed ?? 3;
  if (!Number.isInteger(hintsAllowed) || hintsAllowed < 0 || hintsAllowed > 3) {
    throw new Error("Border Hop hintsAllowed must be an integer from 0 to 3.");
  }
  return { start, target, path, maxGuesses, hintsAllowed };
}

export type RouteConfig = ReturnType<typeof validateRoute>;
export type Guess = { name: string; correct: boolean; message: string };
export type RouteState = { path: string[]; guesses: Guess[]; result: "won" | "lost" | null };

export function initialRoute(config: RouteConfig): RouteState {
  return { path: [config.start], guesses: [], result: null };
}

export function guessCountry(state: RouteState, name: string, config: RouteConfig): RouteState {
  if (state.result) return state;
  const current = state.path[state.path.length - 1];
  const repeated = state.path.includes(name);
  const correct = !repeated && (adjacency[current] ?? []).includes(name);
  const path = correct ? [...state.path, name] : state.path;
  const guesses = [...state.guesses, {
    name, correct,
    message: correct ? `Border crossed to ${name}.` : repeated ? `${name} is already on your route.` : `${name} does not border ${current} in this game.`,
  }];
  const result = correct && name === config.target ? "won" : guesses.length >= config.maxGuesses ? "lost" : null;
  return { path, guesses, result };
}
