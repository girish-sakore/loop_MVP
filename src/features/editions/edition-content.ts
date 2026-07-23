import edition001 from "@/content/editions/edition-001.json";
import edition002 from "@/content/editions/edition-002.json";
import type { Edition } from "@/types/gameplay";

const editions: Record<string, Edition> = {
  [edition001.id]: edition001 as Edition,
  [edition002.id]: edition002 as Edition,
};

export function getAllEditions(): Edition[] {
  return Object.values(editions);
}

export function getEditionById(editionId: string): Edition | null {
  return editions[editionId] ?? null;
}

export function getFeaturedEdition(): Edition {
  return edition001 as Edition;
}
