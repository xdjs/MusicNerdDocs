import { docHref } from "@/lib/docs-paths";

const API_OVERVIEW = "/api-reference";
const API_TAB = "API reference";

/** The header tab a pathname belongs to: its page's tab, the API reference on its overview, else the first tab. */
export function currentTab(pages: { slug: string; category: string }[], pathname: string): string {
  if (pathname === API_OVERVIEW) return API_TAB;
  return pages.find((page) => docHref(page.slug) === pathname)?.category ?? pages[0]?.category ?? "";
}
