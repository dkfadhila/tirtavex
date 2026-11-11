import type { Metadata } from "next";
import { CampaignSection } from "@/components/sections";

export const metadata: Metadata = { title: "Campaigns", alternates: { canonical: "/campaigns" } };

export default function Page() {
  return <CampaignSection full />;
}
