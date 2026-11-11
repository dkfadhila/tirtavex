import { getContent } from "@/lib/content";
import { json, publicCache } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  return json(content, 200, publicCache);
}
