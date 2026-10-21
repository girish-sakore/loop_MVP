import { NextResponse } from "next/server";
import { requireCreator } from "@/lib/require-creator";
import { isUploadedKey } from "@/lib/image-refs";
import { findMissing, presignPut, CACHE_CONTROL } from "@/lib/r2";

export async function POST(req: Request) {
  const auth = await requireCreator();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const keys: unknown = body?.keys;
  if (
    !Array.isArray(keys) || keys.length === 0 || keys.length > 200 ||
    !keys.every((k) => typeof k === "string" && isUploadedKey(k))
  ) {
    return NextResponse.json({ error: "Invalid keys." }, { status: 400 });
  }

  const missing = await findMissing([...new Set(keys as string[])]);
  const uploads = await Promise.all(missing.map(async (key) => ({ key, url: await presignPut(key) })));
  return NextResponse.json({ uploads, cacheControl: CACHE_CONTROL });
}