import type { Metadata } from "next";
import { LegalView } from "@/components/page-views";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Page() {
  return <LegalView slug="privacy" />;
}
