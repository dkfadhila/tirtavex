import type { Metadata } from "next";
import { StatsSection } from "@/components/sections";

export const metadata: Metadata = { title: "Stats", alternates: { canonical: "/stats" } };

export default function Page() {
  return <StatsSection full />;
}
