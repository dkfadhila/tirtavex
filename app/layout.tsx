import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import { getContent } from "@/lib/content";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dm", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#F4FBF8",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tirtavex.vercel.app";
  return {
    metadataBase: new URL(site),
    title: { default: content.settings.metaTitle, template: `%s · ${content.settings.heroTitle}` },
    description: content.settings.metaDescription,
    openGraph: {
      title: content.settings.metaTitle,
      description: content.settings.metaDescription,
      url: site,
      siteName: "Tirta",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: content.settings.metaTitle, description: content.settings.metaDescription },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
        {plausible ? <script defer data-domain={plausible} src="https://plausible.io/js/script.js" /> : null}
      </body>
    </html>
  );
}
