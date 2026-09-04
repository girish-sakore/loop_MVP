import edition001 from "@/content/editions/edition-001.json";
import type { Edition } from "@/types/gameplay";

const editions: Record<string, Edition> = {
  [edition001.id]: edition001 as Edition,
};

export function getEditionById(editionId: string): Edition | null {
  return editions[editionId] ?? null;
}

export function getFeaturedEdition(): Edition {
  return edition001 as Edition;
}

export function getAllEditions(): Edition[] {
  return Object.values(editions).sort((a, b) => a.order - b.order);
}