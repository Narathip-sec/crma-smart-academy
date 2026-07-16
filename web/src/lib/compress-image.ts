// Downscales + re-encodes an image client-side before upload, to cut data
// usage on slow connections. Falls back to the original file untouched if
// anything goes wrong (unsupported format like HEIC, decode failure, etc) —
// compression is a nice-to-have, never a blocker for the upload itself.

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;
const SKIP_BELOW_BYTES = 300_000; // not worth compressing small files

export async function compressImage(file: File): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === "image/jpeg") {
      // Already small enough and already JPEG — re-encoding would only add risk for no gain.
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
