import type { Metadata } from "next";
import { ContestsPage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Contests", alternates: { canonical: "/contests" } };

export default function Page() {
  return <ContestsPage />;
}