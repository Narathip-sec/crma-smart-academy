// Generates the LINE Rich Menu background image (2500x1686, "large" size —
// bumped up from "compact" 843 because tiles were too small to tap reliably).
// Run: npx tsx scripts/generate-rich-menu-image.ts
// Output: assets/rich-menu.png — consumed by scripts/setup-rich-menu.ts.

import { ImageResponse } from "next/og";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const WIDTH = 2500;
const HEIGHT = 1686;

// 2 rows x 3 cols — must match TILES in setup-rich-menu.ts (tap areas + LIFF paths).
const TILES = [
  { icon: "🏠", th: "หน้าหลัก", en: "Home" },
  { icon: "📅", th: "ตารางเรียน", en: "Class" },
  { icon: "✅", th: "งาน", en: "To-do" },
  { icon: "🏆", th: "กิจกรรม", en: "Activity" },
  { icon: "🧭", th: "บริการ", en: "Service" },
  { icon: "👤", th: "โปรไฟล์", en: "Profile" },
];

async function main() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Bold.ttf")),
  ]);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          background: "linear-gradient(135deg, #0FB6AD 0%, #0A8E87 100%)",
          fontFamily: "Sarabun",
        }}
      >
        {TILES.map((tile, i) => (
          <div
            key={tile.en}
            style={{
              width: "33.333%",
              height: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRight: i % 3 !== 2 ? "2px solid rgba(255,255,255,.18)" : "none",
              borderBottom: i < 3 ? "2px solid rgba(255,255,255,.18)" : "none",
            }}
          >
            <div style={{ display: "flex", fontSize: 168, marginBottom: 28 }}>{tile.icon}</div>
            <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: "#fff" }}>{tile.th}</div>
            <div style={{ display: "flex", fontSize: 36, color: "rgba(255,255,255,.8)", marginTop: 6 }}>
              {tile.en}
            </div>
          </div>
        ))}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Sarabun", data: regular, weight: 400, style: "normal" },
        { name: "Sarabun", data: bold, weight: 700, style: "normal" },
      ],
    }
  );

  const buf = Buffer.from(await image.arrayBuffer());
  const outPath = join(process.cwd(), "assets/rich-menu.png");
  await writeFile(outPath, buf);
  console.log(`✔ wrote ${outPath} (${buf.length} bytes, ${WIDTH}x${HEIGHT})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
