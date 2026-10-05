"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { docHref, type NavPage } from "@/lib/docs";
import { currentTab } from "@/lib/docs/ui/currentTab";
import { sidebarGroups } from "@/lib/docs/ui/sidebarGroups";
import { MethodPill } from "./method-pill";

/** The current tab's navigation: the app link, then each group with its pages. Used by the desktop sidebar and the phone drawer. */
export function SidebarNav({ pages, onNavigate }: { pages: NavPage[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const tab = currentTab(pages, pathname);
  return (
    <nav aria-label="Documentation" className="mn-sidebar-nav">
      <div className="mn-nav-links">
        <a href={siteConfig.appUrl} className="mn-nav-app" target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
          </span>
          Music Nerd app
        </a>
      </div>
      {sidebarGroups(pages, tab).map(({ group, pages: groupPages }) => (
        <div className="mn-nav-group" key={group}>
          <p>{group}</p>
          {groupPages.map((page) => {
            const href = docHref(page.slug);
            return (
              <Link key={page.slug} href={href} aria-current={href === pathname ? "page" : undefined} onClick={onNavigate}>
                {page.api && <MethodPill method={page.api.method} />}
                <span>{page.slug ? page.title : "Introduction"}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
