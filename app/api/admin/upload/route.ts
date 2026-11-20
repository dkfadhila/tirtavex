import { put } from "@vercel/blob";
import sharp from "sharp";
import { json, requireAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const MAX_SIDE = 1920;
const QUALITY = 82;

/**
 * Re-encode uploads as WebP, capped at 1920px on the long side, so custom
 * posters and logos stay light on the public site. Animated GIF/WebP keep
 * their frames; transparency is preserved. Falls back to the original file
 * if the image cannot be decoded.
 */
async function toWebp(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const animated = file.type === "image/gif" || file.type === "image/webp";
  const output = await sharp(input, { animated, limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();
  return output;
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: "Blob storage is not configured. Paste an image URL instead." }, 400);
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "Choose an image file." }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use PNG, JPEG, WebP, GIF, or AVIF." }, 400);
  if (file.size > 4.5 * 1024 * 1024) return json({ error: "Images must be under 4.5 MB." }, 400);
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w.]+/g, "-").slice(0, 80) || "image";

  let body: Buffer | File = file;
  let name = file.name.replace(/[^\w.]+/g, "-").slice(0, 80) || "image";
  let contentType = file.type;
  try {
    const webp = await toWebp(file);
    // Keep the original if re-encoding somehow made it bigger (e.g. a tiny optimised WebP).
    if (webp.length < file.size || file.type !== "image/webp") {
      body = webp;
      name = `${base}.webp`;
      contentType = "image/webp";
    }
  } catch (error) {
    console.error("[upload] webp conversion failed, storing original", error instanceof Error ? error.message : error);
  }

  const blob = await put(`portfolio/${Date.now()}-${name}`, body, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return json({ url: blob.url, format: contentType, bytes: body instanceof File ? body.size : body.length, originalBytes: file.size });
}
