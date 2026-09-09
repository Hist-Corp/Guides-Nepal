/**
 * Client-side image compression utility.
 *
 * Uses the browser''s Canvas API to downscale and re-encode images before
 * upload. This reduces bandwidth, upload time, and server storage without
 * visible quality loss.
 */

const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.85;
const MIN_COMPRESS_THRESHOLD = 50 * 1024;

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
  reductionPercent: number;
}

export async function compressImage(
  file: File,
  maxDimension: number = DEFAULT_MAX_DIMENSION,
  quality: number = DEFAULT_QUALITY
): Promise<CompressionResult> {
  const originalSize = file.size;

  if (file.size < MIN_COMPRESS_THRESHOLD || !file.type.startsWith("image/")) {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false, reductionPercent: 0 };
  }

  if (file.type === "image/gif") {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false, reductionPercent: 0 };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    let newWidth = width;
    let newHeight = height;
    const longest = Math.max(width, height);

    if (longest > maxDimension) {
      const scale = maxDimension / longest;
      newWidth = Math.round(width * scale);
      newHeight = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) { bitmap.close(); return { file, originalSize, compressedSize: originalSize, wasCompressed: false, reductionPercent: 0 }; }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });

    if (!blob || blob.size >= originalSize) {
      return { file, originalSize, compressedSize: originalSize, wasCompressed: false, reductionPercent: 0 };
    }

    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      wasCompressed: true,
      reductionPercent: Math.round((1 - compressedFile.size / originalSize) * 100),
    };
  } catch {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false, reductionPercent: 0 };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
/**
 * Fetch an image from a remote URL and return it as a File object.
 * Used by ImagePicker's "upload from URL" flow. Throws if the fetch fails
 * or the response isn't an image.
 */
export async function fetchImageAsFile(url: string, filename = "remote-image"): Promise<File> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  const ext = type.includes("png") ? "png" : "jpg";
  const base = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
  return new File([blob], `${base}.${ext}`, { type });
}

/**
 * Build a local preview (object URL) for a File, or its blobFile when given
 * a CompressionResult. Returns an empty string on failure.
 */
export function generatePreview(source: File | { file: File }): string {
  try {
    const file = source instanceof File ? source : (source as { file: File }).file;
    return file ? URL.createObjectURL(file) : "";
  } catch {
    return "";
  }
}
