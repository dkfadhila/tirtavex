import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/page-views";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project", alternates: { canonical: `/projects/${slug}` } };
  return { title: project.name, description: project.overview, alternates: { canonical: `/projects/${slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
