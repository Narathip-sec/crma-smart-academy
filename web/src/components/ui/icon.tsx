"use client";

// Lightweight inline-SVG icon set (no external dep, stroke = currentColor).
// Add new glyphs here as screens need them.
export type IconName =
  | "bell" | "back" | "search" | "plus" | "check" | "calendar"
  | "meal" | "alert" | "box" | "map-pin" | "chevron-right" | "settings"
  | "grades" | "clock";

const PATHS: Record<IconName, string> = {
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 01-3.4 0",
  back: "M15 18l-6-6 6-6",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.3-4.3",
  plus: "M12 5v14 M5 12h14",
  check: "M20 6L9 17l-5-5",
  calendar: "M3 5h18v16H3z M3 9h18 M8 3v4 M16 3v4",
  meal: "M4 3v18 M8 3v6a2 2 0 01-4 0 M17 3c-1.5 0-3 2-3 5s1.5 4 3 4v9",
  alert: "M12 3l9 16H3z M12 10v4 M12 17v.5",
  box: "M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 4 9-4 M12 11v10",
  "map-pin": "M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z M12 10a2 2 0 100-4 2 2 0 000 4z",
  "chevron-right": "M9 6l6 6-6 6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 00-2-1.2l-.4-2.5H10l-.4 2.5a7 7 0 00-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 005 12a7 7 0 00.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 002 1.2l.4 2.5h4l.4-2.5a7 7 0 002-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0019 12z",
  grades: "M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z M9 13l2 2 4-4",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2",
};

export function Icon({
  name,
  size = 20,
  stroke = "currentColor",
  strokeWidth = 1.7,
}: {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name].split(" M").map((seg, i) => (
        <path key={i} d={(i === 0 ? seg : "M" + seg)} />
      ))}
    </svg>
  );
}
