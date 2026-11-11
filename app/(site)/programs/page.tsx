import type { Metadata } from "next";
import { ProgramsPage } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Programs" };

export default function Page() {
  return <ProgramsPage />;
}
