import type { Prisma } from "@prisma/client";
import type { Edition, EditionNode, Stage, BorderHopStage } from "@/types/gameplay";
import { gameCardSchema, formatImportErrors } from "@/features/games/game-schemas";
import { validateRoute } from "@/features/interactions/border-hop/border-hop-rules";
import { dayString } from "@/lib/date-ist";
import { HttpError } from "@/lib/http-error";

type EditionRow = {
  id: string; title: string; description: string; theme: string; date: Date | null;
  category: string | null; author: string | null; coverImage: string | null; estimatedTime: string | null;
};
type GameRow = {
  id: string; type: string; title: string; subtitle: string | null;
  isPremium: boolean; subStages: Prisma.JsonValue;
};

export class SnapshotError extends HttpError {
  constructor(errors: { path: string; message: string }[]) {
    super(422, { error: "Edition has invalid content. Fix these and try again.", errors });
  }
}

const weekFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

export function buildSnapshot(edition: EditionRow, games: GameRow[]): Edition {
  const errors: { path: string; message: string }[] = [];
  const types = new Set<string>();

  const nodes: EditionNode[] = games.map((g, gi) => {
    if (types.has(g.type)) errors.push({ path: `cards[${gi}]`, message: `Duplicate card type "${g.type}"` });
    types.add(g.type);

    const parsed = gameCardSchema.safeParse({
      type: g.type, title: g.title, subtitle: g.subtitle ?? undefined,
      isPremium: g.isPremium, subStages: g.subStages,
    });
    if (!parsed.success) {
      formatImportErrors(parsed.error).forEach((e) => errors.push({ path: `card "${g.title}" ${e.path}`, message: e.message }));
      return null as never;
    }

    // clue-connect: one substage per case (same rule normalizeSubStage used)
    const flat = (parsed.data.subStages as Record<string, any>[]).flatMap((s) =>
      g.type === "clue-connect" && s.cases.length > 1 ? s.cases.map((c: unknown) => ({ ...s, cases: [c] })) : [s],
    );

    const subStages = flat.map((s, i) => {
      const stage: Record<string, unknown> = { ...s, id: `${g.id}-${i + 1}`, type: g.type };
      if (g.type === "border-hop") {
        const route = validateRoute(stage as unknown as BorderHopStage);
        stage.startCountry = route.start;
        stage.targetCountry = route.target;
      }
      return stage as unknown as Stage;
    });

    return {
      id: g.id, type: g.type, mapTitle: g.title, mapSubtitle: g.subtitle ?? "",
      isPremium: g.isPremium, subStages,
    };
  });

  if (errors.length) throw new SnapshotError(errors);

  const date = edition.date!;
  return {
    id: edition.id, title: edition.title, description: edition.description,
    estimatedTime: edition.estimatedTime ?? "5 mins", order: 0, theme: edition.theme,
    category: edition.category ?? undefined, author: edition.author ?? undefined,
    coverImage: edition.coverImage ?? undefined,
    publishedAt: dayString(date), weekLabel: weekFmt.format(date), nodes,
  };
}

/** Rebuilds and stores the snapshot inside an existing transaction. */
export async function rebuildSnapshot(tx: Prisma.TransactionClient, editionId: string) {
  const edition = await tx.edition.findUniqueOrThrow({
    where: { id: editionId },
    include: { games: { orderBy: { position: "asc" } } },
  });
  const snapshot = buildSnapshot(edition, edition.games);
  await tx.edition.update({ where: { id: editionId }, data: { snapshot: snapshot as unknown as Prisma.InputJsonValue } });
}