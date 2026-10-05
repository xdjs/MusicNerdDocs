type NavPage = { category: string; group: string };

/** One tab's sidebar: its groups in navigation order, each with its pages. */
export function sidebarGroups<Page extends NavPage>(pages: Page[], tab: string): { group: string; pages: Page[] }[] {
  const inTab = pages.filter((page) => page.category === tab);
  return [...new Set(inTab.map((page) => page.group))].map((group) => ({ group, pages: inTab.filter((page) => page.group === group) }));
}
