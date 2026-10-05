"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { docHref, type NavPage } from "@/lib/docs";
import { currentTab } from "@/lib/docs/ui/currentTab";
import { Brand } from "./brand";
import { HeaderSearch } from "./header-search";
import { NavDrawer } from "./nav-drawer";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";

/** Two rows on desktop (brand, search, links, theme; then the section tabs). On phones: brand, search, theme, then a bar with the drawer button and where you are. */
export function SiteHeader({ pages, tabs }: { pages: NavPage[]; tabs: { name: string; href: string }[] }) {
  const pathname = usePathname();
  const tab = currentTab(pages, pathname);
  const page = pages.find((item) => docHref(item.slug) === pathname);
  return (
    <header className="mn-header">
      <div className="mn-header-row">
        <Brand />
        <HeaderSearch pages={pages} />
        <nav aria-label="Site" className="mn-header-links">
          <a href={siteConfig.apiRepoUrl} className="mn-desktop-only" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={siteConfig.appUrl} className="mn-button mn-desktop-only" target="_blank" rel="noopener noreferrer">
            Open Music Nerd
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </a>
          <SearchDialog pages={pages} />
          <ThemeToggle />
        </nav>
      </div>
      <nav aria-label="Sections" className="mn-tabs">
        {tabs.map((item) => (
          <Link key={item.name} href={item.href} aria-current={item.name === tab ? "page" : undefined}>{item.name}</Link>
        ))}
      </nav>
      <div className="mn-crumbs">
        <NavDrawer pages={pages} tabs={tabs} />
        <p aria-label="You are here">
          {page ? <><span>{page.group}</span><span aria-hidden="true">›</span><strong>{page.slug ? page.title : "Introduction"}</strong></> : <strong>{tab}</strong>}
        </p>
      </div>
    </header>
  );
}
