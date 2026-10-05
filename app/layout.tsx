import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/config";
import { docs, docsCategories, docHref } from "@/lib/docs";
import { SiteHeader } from "@/components/docs/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Music Nerd Docs",
  description: "Guides and API reference for the Music Nerd API.",
};

/** Applies the saved or system theme before paint (same rule as lib/docs/ui/effectiveTheme). */
const themeScript = `try{var s=localStorage.getItem("musicnerd-theme");document.documentElement.dataset.theme=s==="light"||s==="dark"?s:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}`;

const navPages = docs.map(({ slug, title, category, group, api, searchText }) => ({ slug, title, category, group, api, searchText }));
const tabs = docsCategories.map((name) => ({
  name,
  href: name === "API reference" ? "/api-reference" : docHref(docs.find((page) => page.category === name)?.slug ?? ""),
}));

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SiteHeader pages={navPages} tabs={tabs} />
        {children}
      </body>
    </html>
  );
}
