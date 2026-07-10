import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const bold = await readFile(join(process.cwd(), "assets/fonts/Sarabun-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0FB6AD 0%, #0A8E87 100%)",
          borderRadius: 14,
          color: "#fff",
          fontSize: 34,
          fontWeight: 700,
          fontFamily: "Sarabun",
        }}
      >
        น
      </div>
    ),
    { ...size, fonts: [{ name: "Sarabun", data: bold, weight: 700, style: "normal" }] }
  );
}
