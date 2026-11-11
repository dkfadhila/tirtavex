import { NotFoundView } from "@/components/page-views";
import { Shell } from "@/components/shell";
import { SiteProvider } from "@/components/site-provider";
import { getContent } from "@/lib/content";

export default async function NotFound() {
  const content = await getContent();
  return (
    <SiteProvider initial={content}>
      <Shell>
        <NotFoundView />
      </Shell>
    </SiteProvider>
  );
}
