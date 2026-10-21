const BASE = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/$/, "");

/** Keys become CDN URLs. Legacy "/public" paths and https URLs pass through. */
export const assetUrl = (v: string) =>
  !BASE || v.startsWith("/") || v.startsWith("http") ? v : `${BASE}/${v}`;