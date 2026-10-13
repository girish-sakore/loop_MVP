import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export class HttpError extends Error {
  constructor(public status: number, public body: Record<string, unknown>) {
    super(String(body.error ?? "Error"));
  }
}

export function handleError(error: unknown, tag: string) {
  if (error instanceof HttpError) return NextResponse.json(error.body, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json({ error: "Conflict: that date or card type is already taken." }, { status: 409 });
  }
  console.error(`[${tag}]`, error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}