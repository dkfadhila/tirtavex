import type { Metadata } from "next";
import { AboutView } from "@/components/page-views";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function Page() {
  return <AboutView />;
}
