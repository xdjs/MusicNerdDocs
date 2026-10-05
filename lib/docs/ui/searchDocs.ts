type SearchPage = { slug: string; title: string; searchText: string; api?: { path: string } };

const LIMIT = 30;

/** Pages containing every word of the query, best title match first. Moved from the sidebar so the header search can use it. */
export function searchDocs<Page extends SearchPage>(pages: Page[], query: string): Page[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const words = normalized.split(/\s+/);
  const score = (page: Page) => {
    const title = page.title.toLowerCase();
    if (title === normalized) return 100;
    if (title.includes(normalized)) return 60;
    if (page.api?.path.toLowerCase().includes(normalized)) return 40;
    return words.filter((word) => title.includes(word)).length * 10;
  };
  return pages
    .filter((page) => words.every((word) => page.searchText.toLowerCase().includes(word)))
    .sort((a, b) => score(b) - score(a))
    .slice(0, LIMIT);
}
