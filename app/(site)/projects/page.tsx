import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/page-views";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsIndex />;
}
