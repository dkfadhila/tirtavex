import type { Metadata } from "next";
import { ContactSection } from "@/components/sections";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function Page() {
  return <ContactSection full />;
}
