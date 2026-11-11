import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin-app";
import { getAdminSnapshot } from "@/lib/content";
import { verifySession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function Layout() {
  const token = (await cookies()).get("tvx_session")?.value;
  if (!(await verifySession(token, process.env.ADMIN_SESSION_SECRET))) redirect("/admin/login");
  const snapshot = await getAdminSnapshot();
  return <AdminApp initial={snapshot} />;
}
