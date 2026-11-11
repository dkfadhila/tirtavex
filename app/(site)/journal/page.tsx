import type { Metadata } from "next";
import { JournalIndex } from "@/components/page-views";

export const metadata: Metadata = { title: "Journal", alternates: { canonical: "/journal" } };

export default function Page() {
  return <JournalIndex />;
}
