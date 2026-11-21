import type { NavPage } from "../../docs.ts";

/** A page's label in the sidebar: its `sidebarTitle`, else its title; the home page is "Introduction". */
export function navLabel(page: Pick<NavPage, "slug" | "title" | "sidebarTitle">): string {
  if (!page.slug) return "Introduction";
  return page.sidebarTitle || page.title;
}
