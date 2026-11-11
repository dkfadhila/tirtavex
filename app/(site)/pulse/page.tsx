import type { Metadata } from "next";
import { PulsePage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Numbers" };

export default function Page() {
  return <PulsePage />;
}
