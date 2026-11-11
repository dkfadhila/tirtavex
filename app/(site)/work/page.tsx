import type { Metadata } from "next";
import { WorkSection } from "@/components/sections";

export const metadata: Metadata = { title: "The Cut", alternates: { canonical: "/work" } };

export default function Page() {
  return <WorkSection full />;
}
