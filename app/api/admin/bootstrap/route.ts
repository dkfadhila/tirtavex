import { requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return run(() => getAdminSnapshot());
}
