import type { Metadata } from "next";
import { LegalView } from "@/components/page-views";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function Page() {
  return <LegalView slug="terms" />;
}
