import { put } from "@vercel/blob";
import { json, requireAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: "Blob storage is not configured. Paste an image URL instead." }, 400);
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "Choose an image file." }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: "Use PNG, JPEG, WebP, GIF, or AVIF." }, 400);
  if (file.size > 4.5 * 1024 * 1024) return json({ error: "Images must be under 4.5 MB." }, 400);
  const name = file.name.replace(/[^\w.]+/g, "-").slice(0, 80) || "image";
  const blob = await put(`portfolio/${Date.now()}-${name}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return json({ url: blob.url });
}
