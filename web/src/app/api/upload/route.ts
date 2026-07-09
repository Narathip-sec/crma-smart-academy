// Client-upload endpoint for Vercel Blob.
// The browser requests a one-time upload token here, then uploads the file
// directly to Blob storage — this bypasses the ~4.5 MB serverless body limit
// and keeps BLOB_READ_WRITE_TOKEN server-side only.
//
// Client usage (e.g. Lost & Found / Report photo picker):
//   import { upload } from "@vercel/blob/client";
//   const blob = await upload(file.name, file, {
//     access: "public",
//     handleUploadUrl: "/api/upload",
//   });
//   // blob.url -> store on the related record

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest): Promise<Response> {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname, userId: user.id }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Fires only when the app is reachable on a public URL (i.e. on
        // Vercel, not localhost). Persist blob.url to the owning record here,
        // e.g. lost_found_attachment / report_attachment / activity_image.
        console.log("[blob] upload completed:", blob.url);
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
