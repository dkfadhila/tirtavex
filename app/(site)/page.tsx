import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Page() {
  const content = await getContent();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tirtavex.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: content.settings.heroTitle,
        alternateName: `@${content.settings.xHandle}`,
        url: site,
        description: content.settings.metaDescription,
        sameAs: [content.settings.xUrl],
      },
      {
        "@type": "ItemList",
        itemListElement: content.work.slice(0, 12).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@type": "CreativeWork", name: item.title, url: item.xUrl },
        })),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HomeView />
    </>
  );
}
