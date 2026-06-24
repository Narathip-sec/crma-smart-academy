// Shared helpers for CSV import scripts.
// Run from web/ (cwd = web). CSV files live in ../docs/ingested/.
//
//   npx tsx scripts/import-class-schedule.ts --dry
//   npx tsx scripts/import-class-schedule.ts            # writes to DB
//
// Writing requires a live DATABASE_URL (Prisma Postgres / Accelerate).
// --dry parses + summarizes only, no DB connection.

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

export const INGEST_DIR = path.resolve(process.cwd(), "..", "docs", "ingested");

export function readCsv<T = Record<string, string>>(fileName: string): T[] {
  const full = path.isAbsolute(fileName)
    ? fileName
    : path.join(INGEST_DIR, fileName);
  const content = fs.readFileSync(full, "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as T[];
}

// ── field coercion ───────────────────────────────────────────────────────────

export function toInt(v: string | undefined): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

export function reqInt(v: string | undefined, field: string): number {
  const n = toInt(v);
  if (n == null) throw new Error(`missing/invalid int for "${field}": ${JSON.stringify(v)}`);
  return n;
}

export function nullStr(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
}

export function reqStr(v: string | undefined, field: string): string {
  const s = nullStr(v);
  if (s == null) throw new Error(`missing string for "${field}"`);
  return s;
}

/** Validate against an allowed enum set; fall back (with a warning) if unknown. */
export function oneOf<T extends readonly string[]>(
  value: string,
  allowed: T,
  fallback: T[number],
  field: string,
): T[number] {
  const v = (value ?? "").trim();
  if ((allowed as readonly string[]).includes(v)) return v as T[number];
  if (v) console.warn(`  ⚠ ${field}: unknown "${v}" -> "${fallback}"`);
  return fallback;
}

/** ISO yyyy-mm-dd -> Date at UTC midnight (for Prisma @db.Date columns). */
export function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

// ── CLI args ─────────────────────────────────────────────────────────────────

export function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

export function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// ── Prisma (Accelerate) ──────────────────────────────────────────────────────

// Plain client (direct postgres://). Scripts are local/admin tools — no
// Accelerate. Requires a client generated WITH an engine (i.e. `prisma generate`
// without --no-engine; `prisma migrate dev` does this automatically).
export function getPrisma() {
  return new PrismaClient();
}

/** Count occurrences of a key — handy for import summaries. */
export function countBy<T>(rows: T[], key: (r: T) => string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    const k = key(r);
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}
