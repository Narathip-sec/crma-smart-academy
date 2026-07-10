import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Bold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0FB6AD 0%, #0A8E87 100%)",
          fontFamily: "Sarabun",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "rgba(255,255,255,.22)",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          น
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#fff" }}>
          CRMA Smart Academy
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,.85)", marginTop: 16 }}>
          โรงเรียนนายร้อยพระจุลจอมเกล้า
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Sarabun", data: regular, weight: 400, style: "normal" },
        { name: "Sarabun", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
