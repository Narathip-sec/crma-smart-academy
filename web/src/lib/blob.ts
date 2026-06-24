// Vercel Blob helpers — image/file storage for Lost & Found, Report, Activity.
// Requires BLOB_READ_WRITE_TOKEN (auto-injected by Vercel when a Blob store
// is connected to the project; set manually for local dev).
//
// Two upload paths:
//  - Small server-side uploads  -> uploadBlob() below (≤4.5 MB serverless body limit).
//  - Browser uploads of larger files -> client upload via POST /api/upload
//    (see src/app/api/upload/route.ts), which bypasses the body limit.

import { put, del, list } from "@vercel/blob";

/** Folder prefixes keep the bucket organised per domain. */
export const blobFolders = {
  lostFound: "lost-found",
  report: "report",
  activity: "activity",
} as const;

export type BlobFolder = (typeof blobFolders)[keyof typeof blobFolders];

type PutBody = Parameters<typeof put>[1];

/**
 * Server-side upload. Use for small files only (serverless request body cap
 * ~4.5 MB). For larger browser uploads use the /api/upload client flow.
 */
export async function uploadBlob(
  folder: BlobFolder,
  filename: string,
  body: PutBody,
) {
  return put(`${folder}/${filename}`, body, {
    access: "public",
    addRandomSuffix: true,
  });
}

export { del as deleteBlob, list as listBlobs };
