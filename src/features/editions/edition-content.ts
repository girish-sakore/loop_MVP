import fs from "node:fs";
import path from "node:path";

import type { ClueConnectStage, Edition, EditionNode, Stage } from "@/types/gameplay";
import { prisma } from "@/lib/db";

const editionsDirectory = path.join(process.cwd(), "src/content/editions");

let fileEditionCache: Edition[] | null = null;

function loadFileEditions(): Edition[] {
  if (fileEditionCache) return fileEditionCache;

  const files = fs
    .readdirSync(editionsDirectory)
    .filter((file) => file.endsWith(".json"))
    .sort();

  fileEditionCache = files
    .map((file) => {
      const content = fs.readFileSync(path.join(editionsDirectory, file), "utf8");
      return normalizeEdition(JSON.parse(content) as Edition);
    })
    .sort((a, b) => a.order - b.order);

  return fileEditionCache;
}

export async function getEditionById(editionId: string): Promise<Edition | null> {
  const now = new Date();
  const stored = await prisma.edition.findFirst({
    where: {
      slug: editionId,
      OR: [{ status: "published" }, { status: "scheduled", releaseAt: { lte: now } }],
    },
    orderBy: { releaseAt: "desc" },
  });
  return stored ? normalizeEdition(stored.content as unknown as Edition) : loadFileEditions().find((edition) => edition.id === editionId) ?? null;
}

export async function getFeaturedEdition(): Promise<Edition> {
  const now = new Date();
  const stored = await prisma.edition.findFirst({
    where: { status: { in: ["scheduled", "published"] }, releaseAt: { lte: now } },
    orderBy: { releaseAt: "desc" },
  });
  return stored ? normalizeEdition(stored.content as unknown as Edition) : loadFileEditions()[0];
}

export async function getAllEditions(): Promise<Edition[]> {
  const now = new Date();
  const stored = await prisma.edition.findMany({
    where: {
      OR: [{ status: "published" }, { status: "scheduled", releaseAt: { lte: now } }],
    },
    orderBy: [{ releaseAt: "desc" }, { createdAt: "desc" }],
  });
  return stored.length > 0
    ? stored.map((edition) => normalizeEdition(edition.content as unknown as Edition))
    : loadFileEditions();
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
