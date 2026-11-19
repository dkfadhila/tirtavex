import type { Metadata } from "next";
import { RateCardSection } from "@/components/sections";

export const metadata: Metadata = { title: "Rate Card", alternates: { canonical: "/rates" } };

export default function Page() {
  return <RateCardSection full />;
}
