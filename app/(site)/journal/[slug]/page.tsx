import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/page-views";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const article = content.articles.find((item) => item.slug === slug);
  if (!article) return { title: "Journal", alternates: { canonical: `/journal/${slug}` } };
  return { title: article.title, description: article.excerpt, alternates: { canonical: `/journal/${slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const article = content.articles.find((item) => item.slug === slug && item.kind === "article");
  if (!article) notFound();
  return <ArticleView article={article} />;
}
