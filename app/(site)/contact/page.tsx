import type { Metadata } from "next";
import { ContactView } from "@/components/page-views";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactView />;
}
