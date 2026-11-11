import type { Metadata } from "next";
import { JournalIndex } from "@/components/page-views";

export const metadata: Metadata = { title: "Journal" };

export default function Page() {
  return <JournalIndex />;
}
