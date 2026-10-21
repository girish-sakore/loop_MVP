// src/components/admin/image-pipeline.ts
import { collectImages, mapImages } from "@/lib/image-refs";

const MAX_EDGE = 1200;
const QUALITY = 0.82;
const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

/** "Statue of Unity", "statue_of_unity.PNG", "Statue-Of-Unity.webp" all become "statueofunity" */
const normalize = (s: string) =>
  s.split("/").pop()!.replace(EXT, "").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function analyse(json: unknown, files: File[]) {
  const refs = collectImages(json);
  const byName = new Map<string, File[]>();
  for (const f of files) {
    const n = normalize(f.name);
    byName.set(n, [...(byName.get(n) ?? []), f]);
  }

  const matched = new Map<string, File>();
  const used = new Set<File>();
  const missing: string[] = [];
  const ambiguous: string[] = [];
  const legacy: string[] = []; // "/images/..." paths with no uploaded file, left as-is

  for (const ref of refs) {
    if (ref.startsWith("https://")) continue;
    const list = byName.get(normalize(ref));
    if (list?.length) {
      matched.set(ref, list[0]);
      list.forEach((f) => used.add(f));
      if (list.length > 1) ambiguous.push(ref);
    } else if (ref.startsWith("/")) legacy.push(ref);
    else missing.push(ref);
  }
  return { total: refs.length, matched, missing, ambiguous, legacy, unused: files.filter((f) => !used.has(f)) };
}

async function keyFor(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 12);
  const slug = file.name.replace(EXT, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  return `img/${hash}-${slug}.webp`;
}

/** Hash only (cheap). Returns the JSON with image names replaced by final keys. */
export async function rewriteWithKeys(json: unknown, matched: Map<string, File>) {
  const refToKey = new Map<string, string>();
  const keyToFile = new Map<string, File>();
  for (const [ref, file] of matched) {
    const key = await keyFor(file);
    refToKey.set(ref, key);
    keyToFile.set(key, file);
  }
  return { rewritten: mapImages(json, (v) => refToKey.get(v) ?? v), keyToFile };
}

async function toWebp(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", QUALITY));
  if (!blob || blob.type !== "image/webp") throw new Error(`Could not convert ${file.name}. Please use Chrome or Edge.`);
  return blob;
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

export async function uploadMissing(keyToFile: Map<string, File>, onProgress: (m: string) => void) {
  if (!keyToFile.size) return;
  const res = await fetch("/api/admin/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys: [...keyToFile.keys()] }),
  });
  if (!res.ok) throw new Error("Could not get upload permission.");
  const { uploads, cacheControl } = (await res.json()) as {
    uploads: { key: string; url: string }[];
    cacheControl: string;
  };

  let done = 0;
  await pool(uploads, 4, async ({ key, url }) => {
    const blob = await toWebp(keyToFile.get(key)!);
    const put = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "image/webp", "Cache-Control": cacheControl },
      body: blob,
    });
    if (!put.ok) throw new Error(`Upload failed for ${keyToFile.get(key)!.name}.`);
    onProgress(`Uploading images ${++done}/${uploads.length}…`);
  });
}