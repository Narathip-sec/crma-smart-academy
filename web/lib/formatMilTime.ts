// Port 1:1 from predecessor app/src/lib/formatMilTime.ts
// Returns military time string as-is (already "HHMM" format).
// Throws for invalid input so callers get an early signal.
const MIL_RE = /^([01]\d|2[0-3])([0-5]\d)$/

export function formatMilTime(mil: string): string {
  if (!MIL_RE.test(mil)) {
    throw new Error(`formatMilTime: invalid 4-digit military time "${mil}"`)
  }
  return mil
}
