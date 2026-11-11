import { Shell } from "@/components/shell";
import { SiteProvider } from "@/components/site-provider";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  return (
    <SiteProvider initial={content}>
      <Shell>{children}</Shell>
    </SiteProvider>
  );
}
