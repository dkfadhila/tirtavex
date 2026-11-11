import { requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return run(() => getAdminSnapshot());
}
