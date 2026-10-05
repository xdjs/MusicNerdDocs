import { describe, expect, it } from "vitest";
import { searchDocs } from "@/lib/docs/ui/searchDocs";

const page = (slug: string, title: string, searchText: string, path?: string) => ({ slug, title, searchText, api: path ? { method: "GET", path, spec: null } : undefined });
const pages = [
  page("quickstart", "Quickstart", "quickstart first request health"),
  page("api-reference/health/get", "Check health", "check health api health", "/api/health"),
  page("api-reference/artists/research-refresh", "Look again", "look again research lore", "/api/artist/{id}/research/refresh"),
];

describe("searchDocs", () => {
  it("returns nothing for a blank query", () => {
    expect(searchDocs(pages, "  ")).toEqual([]);
  });

  it("keeps pages containing every word, best title match first", () => {
    expect(searchDocs(pages, "health").map((result) => result.slug)).toEqual(["api-reference/health/get", "quickstart"]);
  });

  it("matches across words", () => {
    expect(searchDocs(pages, "research lore").map((result) => result.slug)).toEqual(["api-reference/artists/research-refresh"]);
  });

  it("caps the results", () => {
    const many = Array.from({ length: 40 }, (_, index) => page(`p${index}`, `Page ${index}`, "shared"));
    expect(searchDocs(many, "shared")).toHaveLength(30);
  });
});
