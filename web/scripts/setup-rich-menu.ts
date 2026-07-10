// Creates + uploads + sets the default LINE Rich Menu.
// Run: npx tsx scripts/setup-rich-menu.ts
//
// Requires (env):
//   LINE_CHANNEL_ACCESS_TOKEN — Messaging API channel access token (LINE Developers
//     Console → your Messaging API channel → Messaging API tab → issue a long-lived token).
//     This is NOT the LIFF ID and NOT the LIFF channel secret.
//   NEXT_PUBLIC_LIFF_ID — already in .env; used to build the liff.line.me deep links.
//
// Prereq: run `npx tsx scripts/generate-rich-menu-image.tsx` first to produce
// assets/rich-menu.png (2500x843). This script uploads that file as-is.
//
// Idempotent-ish: re-running creates a NEW rich menu and re-points the default;
// it does not delete old ones. Clean up stale menus with the LINE Rich Menu API
// (GET/DELETE https://api.line.me/v2/bot/richmenu/list) if you re-run this often.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID;

const WIDTH = 2500;
const HEIGHT = 843;
const COLS = 3;
const ROWS = 2;

// Must match TILES order in generate-rich-menu-image.tsx.
const TILES = [
  { path: "/", label: "Home" },
  { path: "/class", label: "Class" },
  { path: "/todo", label: "To-do" },
  { path: "/activity", label: "Activity" },
  { path: "/service", label: "Service" },
  { path: "/profile", label: "Profile" },
];

function buildAreas(liffId: string) {
  const cellW = Math.floor(WIDTH / COLS);
  const cellH = Math.floor(HEIGHT / ROWS);
  return TILES.map((tile, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      bounds: { x: col * cellW, y: row * cellH, width: cellW, height: cellH },
      action: { type: "uri", label: tile.label, uri: `https://liff.line.me/${liffId}${tile.path}` },
    };
  });
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error("Missing LINE_CHANNEL_ACCESS_TOKEN — see comment at top of this script.");
    process.exit(1);
  }
  if (!LIFF_ID) {
    console.error("Missing NEXT_PUBLIC_LIFF_ID in env.");
    process.exit(1);
  }

  const imagePath = join(process.cwd(), "assets/rich-menu.png");
  const image = await readFile(imagePath).catch(() => {
    console.error(`Missing ${imagePath} — run: npx tsx scripts/generate-rich-menu-image.tsx`);
    process.exit(1);
  });

  const authHeaders = { Authorization: `Bearer ${ACCESS_TOKEN}` };

  console.log("Creating rich menu definition...");
  const createRes = await fetch("https://api.line.me/v2/bot/richmenu", {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      size: { width: WIDTH, height: HEIGHT },
      selected: true,
      name: "CRMA Smart Academy — main menu",
      chatBarText: "เมนู",
      areas: buildAreas(LIFF_ID),
    }),
  });
  if (!createRes.ok) {
    console.error("Create failed:", createRes.status, await createRes.text());
    process.exit(1);
  }
  const { richMenuId } = (await createRes.json()) as { richMenuId: string };
  console.log(`✔ richMenuId: ${richMenuId}`);

  console.log("Uploading image...");
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "image/png" },
    body: new Uint8Array(image),
  });
  if (!uploadRes.ok) {
    console.error("Upload failed:", uploadRes.status, await uploadRes.text());
    process.exit(1);
  }
  console.log("✔ image uploaded");

  console.log("Setting as default for all users...");
  const setDefaultRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
    method: "POST",
    headers: authHeaders,
  });
  if (!setDefaultRes.ok) {
    console.error("Set-default failed:", setDefaultRes.status, await setDefaultRes.text());
    process.exit(1);
  }
  console.log(`✔ set as default rich menu. Done: ${richMenuId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
