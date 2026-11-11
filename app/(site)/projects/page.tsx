import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/page-views";

export const metadata: Metadata = { title: "Projects", alternates: { canonical: "/projects" } };

export default function Page() {
  return <ProjectsIndex />;
}
