import type { Metadata } from "next";
import { AboutSection } from "@/components/sections";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function Page() {
  return <AboutSection full />;
}
