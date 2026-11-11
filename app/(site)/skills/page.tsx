import type { Metadata } from "next";
import { SkillsSection } from "@/components/sections";

export const metadata: Metadata = { title: "Skills", alternates: { canonical: "/skills" } };

export default function Page() {
  return <SkillsSection full />;
}
