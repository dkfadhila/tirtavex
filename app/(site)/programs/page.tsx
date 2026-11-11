import type { Metadata } from "next";
import { ProgramsPage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Programs", alternates: { canonical: "/programs" } };

export default function Page() {
  return <ProgramsPage />;
}
