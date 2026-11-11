import type { Metadata } from "next";
import { AdminApp } from "@/components/admin-app";
import { getAdminSnapshot } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function Layout() {
  const snapshot = await getAdminSnapshot();
  return <AdminApp initial={snapshot} />;
}
