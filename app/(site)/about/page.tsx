import type { Metadata } from "next";
import { AboutView } from "@/components/page-views";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <AboutView />;
}
