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

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // TODO: verify the LIFF/session identity and RBAC before issuing a
        // token (see src/lib/liff.ts / rbac). Reject unauthenticated uploads.
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
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
