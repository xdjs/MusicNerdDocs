import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Music Nerd Docs",
  description: "Guides and API reference for the Music Nerd API.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-brand">
            <Image src="/logo.png" alt="" width={32} height={32} priority />
            Music Nerd <span>Docs</span>
          </Link>
          <nav className="site-links" aria-label="Site">
            <Link className="site-hide-sm" href="/api-reference">API reference</Link>
            <a className="site-hide-sm" href={siteConfig.apiRepoUrl}>GitHub</a>
            <a className="site-action" href={siteConfig.appUrl}>Open Music Nerd</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
