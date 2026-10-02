import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { validateDailyGamePayload } from "@/lib/daily-game-validation";
import { getAuthSession } from "@/lib/auth-session";
import { isProvider } from "@/lib/provider-auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isProvider(session.user.email)) return NextResponse.json({ error: "Provider access required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const scheduledFor = parseDate(body?.scheduledFor);
  const type = body?.type;
  const payload = body?.payload;
  if (!scheduledFor) return NextResponse.json({ error: "scheduledFor must be a YYYY-MM-DD date." }, { status: 400 });
  if (typeof type !== "string") return NextResponse.json({ error: "type is required." }, { status: 400 });

  const errors = validateDailyGamePayload(type, payload);
  if (errors.length > 0) return NextResponse.json({ error: "Invalid game payload.", errors }, { status: 400 });

  const game = await prisma.dailyGame.upsert({
    where: { scheduledFor },
    create: { scheduledFor, type, payload: payload as Prisma.InputJsonValue, createdById: session.user.id },
    update: { type, payload: payload as Prisma.InputJsonValue },
    select: { id: true, scheduledFor: true, type: true, updatedAt: true },
  });

  return NextResponse.json({ game }, { status: 201 });
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}
