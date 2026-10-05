import { describe, expect, it } from "vitest";
import { sidebarGroups } from "@/lib/docs/ui/sidebarGroups";

const pages = [
  { slug: "", title: "Intro", category: "Guides", group: "Getting started" },
  { slug: "quickstart", title: "Quickstart", category: "Guides", group: "Getting started" },
  { slug: "api-reference/health/get", title: "Check health", category: "API reference", group: "Health" },
  { slug: "api-reference/research/advance", title: "Advance research", category: "API reference", group: "Research" },
  { slug: "api-reference/artists/research-refresh", title: "Look again", category: "API reference", group: "Research" },
];

describe("sidebarGroups", () => {
  it("lists one tab's groups in navigation order, each with its pages", () => {
    expect(sidebarGroups(pages, "API reference")).toEqual([
      { group: "Health", pages: [pages[2]] },
      { group: "Research", pages: [pages[3], pages[4]] },
    ]);
  });

  it("returns nothing for an unknown tab", () => {
    expect(sidebarGroups(pages, "Changelog")).toEqual([]);
  });
});
