import type { Metadata } from "next";
import { NotFoundView } from "@/components/page-views";

export const metadata: Metadata = { title: "Not found", alternates: { canonical: "/404" } };

export default function NotFound() {
  return <NotFoundView />;
}
