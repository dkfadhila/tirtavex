import type { Metadata } from "next";
import { LegalView } from "@/components/page-views";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return <LegalView slug="terms" />;
}
