import type { Metadata } from "next";
import { WorkIndex } from "@/components/studio-pages";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return <WorkIndex />;
}
