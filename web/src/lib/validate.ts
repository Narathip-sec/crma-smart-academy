// Small, dependency-free input validation helpers for API routes.

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isAllowedBlobUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export function boundedString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

export function boundedStringOptional(v: unknown, max: number): v is string | undefined {
  return v === undefined || boundedString(v, max);
}

export function validDate(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

export function intInRange(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
}
