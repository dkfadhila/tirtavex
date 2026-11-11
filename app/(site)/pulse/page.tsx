import type { Metadata } from "next";
import { PulsePage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Numbers", alternates: { canonical: "/pulse" } };

export default function Page() {
  return <PulsePage />;
}
