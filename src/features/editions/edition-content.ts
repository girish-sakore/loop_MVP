import fs from "node:fs";
import path from "node:path";

import type { BorderHopStage, ClueConnectStage, Edition, EditionNode, Stage } from "@/types/gameplay";
import { validateRoute } from "@/features/interactions/border-hop/border-hop-rules";

const editionsDirectory = path.join(process.cwd(), "src/content/editions");

let editionCache: Edition[] | null = null;

function loadEditions(): Edition[] {
  if (editionCache) return editionCache;

  const files = fs
    .readdirSync(editionsDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort();

  editionCache = files
    .map((file) => {
      const content = fs.readFileSync(path.join(editionsDirectory, file), "utf8");
      return normalizeEdition(JSON.parse(content) as Edition);
    })
    .sort((a, b) => a.order - b.order);

  return editionCache;
}

export function getEditionById(editionId: string): Edition | null {
  return loadEditions().find((edition) => edition.id === editionId) ?? null;
}

export function getFeaturedEdition(): Edition {
  return loadEditions()[0];
}

export function getAllEditions(): Edition[] {
  return loadEditions();
}

function normalizeEdition(edition: Edition): Edition {
  return {
    ...edition,
    nodes: edition.nodes.map(normalizeNode),
  };
}

function normalizeNode(node: EditionNode): EditionNode {
  return {
    ...node,
    subStages: node.subStages.flatMap((stage, index) =>
      normalizeSubStage(node, stage, index),
    ),
  };
}

function normalizeSubStage(
  node: EditionNode,
  stage: Stage,
  index: number,
): Stage[] {
  if (node.type === "border-hop") {
    const borderStage = stage as BorderHopStage;
    try {
      const route = validateRoute(borderStage);
      return [{ ...borderStage, type: "border-hop", startCountry: route.start, targetCountry: route.target }];
    } catch (error) {
      throw new Error(`Invalid Border Hop stage ${node.id}/${stage.id ?? index}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (node.type !== "clue-connect" || !isClueConnectStage(stage)) {
    return [stage];
  }

  if (stage.cases.length <= 1) {
    return [stage];
  }

  const baseId = stage.id ?? `${node.id}-stage-${index + 1}`;
  return stage.cases.map((clueCase, caseIndex) => ({
    ...stage,
    id: `${baseId}-${clueCase.id || caseIndex + 1}`,
    cases: [clueCase],
  }));
}

function isClueConnectStage(stage: Stage): stage is ClueConnectStage {
  return "cases" in stage && Array.isArray(stage.cases);
}
