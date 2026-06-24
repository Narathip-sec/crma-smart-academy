// Design tokens — Academy Teal (approved Claude Design mock).
// Colors live in globals.css as CSS vars; these constants are for
// any TS-side computation or token-name validation (rare).

export const COLOR_TOKENS = [
  "brand", "brand-dark", "brand-darker",
  "bg", "stage", "surface", "tint", "tint-2",
  "ink", "muted", "line",
  "danger", "success", "warning",
] as const;

export type ColorToken = typeof COLOR_TOKENS[number];

// Brand teal — confirmed 2026-06-16 from the mock.
export const BRAND = "#0BA8A0";

// Card radius range from the mock / UX style guide.
export const CARD_RADIUS = 20; // 16–24px range

// LIFF is mobile-only (no responsive desktop). Container is full-width
// on device; capped width keeps it phone-like when previewed on desktop.
export const MAX_W = 420;
