/** Deep-maps every string field named "image". Works for any interaction type. */
export function mapImages<T>(node: T, fn: (v: string) => string): T {
  if (Array.isArray(node)) return node.map((v) => mapImages(v, fn)) as T;
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) =>
        k === "image" && typeof v === "string" && v.trim()
          ? [k, fn(v.trim())]
          : [k, mapImages(v, fn)],
      ),
    ) as T;
  }
  return node;
}

export function collectImages(node: unknown): string[] {
  const out = new Set<string>();
  mapImages(node, (v) => (out.add(v), v));
  return [...out];
}

export const isUploadedKey = (v: string) => /^img\/[a-f0-9]{12}-[a-z0-9-]+\.webp$/.test(v);