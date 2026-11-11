import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tirtavex.vercel.app";
  const staticRoutes = ["", "/work", "/projects", "/about", "/journal", "/contact", "/pulse", "/programs", "/contests", "/terms", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const projects = content.projects.map((item) => ({ url: `${base}/projects/${item.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  const articles = content.articles.filter((item) => item.kind === "article" && item.slug).map((item) => ({
    url: `${base}/journal/${item.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...staticRoutes, ...projects, ...articles];
}
