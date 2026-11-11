import type { Metadata } from "next";
import { ContactView } from "@/components/page-views";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function Page() {
  return <ContactView />;
}
