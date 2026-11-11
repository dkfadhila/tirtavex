import type { Metadata } from "next";
import { PartnerSection } from "@/components/sections";

export const metadata: Metadata = { title: "Partners", alternates: { canonical: "/partners" } };

export default function Page() {
  return <PartnerSection full />;
}
