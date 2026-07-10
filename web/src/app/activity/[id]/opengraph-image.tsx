import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, regular, bold] = await Promise.all([
    prisma.activityEvent
      .findUnique({
        where: { id },
        select: { titleTh: true, location: true, category: { select: { nameTh: true } } },
      })
      .catch(() => null),
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Sarabun-Bold.ttf")),
  ]);

  const title = event?.titleTh ?? "กิจกรรม";
  const meta = [event?.category?.nameTh, event?.location].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(135deg, #0FB6AD 0%, #0A8E87 100%)",
          fontFamily: "Sarabun",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,.8)", marginBottom: 12 }}>
          CRMA Smart Academy · กิจกรรม
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
          {title}
        </div>
        {meta && (
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,.85)", marginTop: 20 }}>
            {meta}
          </div>
        )}
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
