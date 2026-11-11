import type { Metadata } from "next";
import { ContestsPage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Contests" };

export default function Page() {
  return <ContestsPage />;
}