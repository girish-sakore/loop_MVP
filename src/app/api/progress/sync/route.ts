// app/api/progress/sync/route.ts

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  fromServerPayload,
  mergeSnapshots,
  toServerPayload,
  type GameplaySnapshot,
} from "@/features/gameplay/progress/resume";
import { rowToSnapshot, snapshotToRowData } from "@/features/gameplay/progress/progress-row.server";

const MAX_CLOCK_SKEW_MS = 60_000;

async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const editionId = url.searchParams.get("editionId");
  const nodeId = url.searchParams.get("nodeId");
  if (!editionId || !nodeId) {
    return NextResponse.json({ error: "editionId and nodeId are required" }, { status: 400 });
  }

  const row = await prisma.userNodeProgress.findUnique({
    where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
  });
  const snapshot = rowToSnapshot(row);
  return NextResponse.json({ progress: snapshot ? toServerPayload(snapshot) : null });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const editionId = body?.editionId;
  const nodeId = body?.nodeId;
  if (typeof editionId !== "string" || typeof nodeId !== "string") {
    return NextResponse.json({ error: "editionId and nodeId are required" }, { status: 400 });
  }

  const incoming = fromServerPayload(body);
  if (!incoming) return NextResponse.json({ error: "invalid progress payload" }, { status: 400 });

  // A device with a wrong clock must not win every tie forever.
  incoming.updatedAt = Math.min(incoming.updatedAt, Date.now() + MAX_CLOCK_SKEW_MS);

  const merged = await writeMerged(userId, editionId, nodeId, incoming);
  return NextResponse.json({ progress: toServerPayload(merged) });
}

/**
 * Locks the row for the duration of the transaction (SELECT ... FOR UPDATE), so
 * two devices saving at the same instant can't overwrite each other. If the
 * row doesn't exist yet, a concurrent first write from two devices is
 * handled by catching the unique-constraint error and retrying as an update.
 */
async function writeMerged(
  userId: string,
  editionId: string,
  nodeId: string,
  incoming: GameplaySnapshot,
): Promise<GameplaySnapshot> {
  try {
    return await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "user_node_progress"
        WHERE "userId" = ${userId} AND "editionId" = ${editionId} AND "nodeId" = ${nodeId}
        FOR UPDATE
      `;

      if (locked.length === 0) {
        await tx.userNodeProgress.create({
          data: { userId, editionId, nodeId, startedAt: new Date(), ...snapshotToRowData(incoming) },
        });
        return incoming;
      }

      const row = await tx.userNodeProgress.findUniqueOrThrow({
        where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
      });
      const existing = rowToSnapshot(row);
      const mergedSnapshot = existing ? mergeSnapshots(existing, incoming) : incoming;

      await tx.userNodeProgress.update({
        where: { userId_editionId_nodeId: { userId, editionId, nodeId } },
        data: snapshotToRowData(mergedSnapshot),
      });
      return mergedSnapshot;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return writeMerged(userId, editionId, nodeId, incoming);
    }
    throw err;
  }
}