import { describe, expect, it } from "vitest";
import { currentTab } from "@/lib/docs/ui/currentTab";

const pages = [
  { slug: "", category: "Guides" },
  { slug: "quickstart", category: "Guides" },
  { slug: "api-reference/health/get", category: "API reference" },
];

describe("currentTab", () => {
  it("is the tab of the page at the pathname", () => {
    expect(currentTab(pages, "/")).toBe("Guides");
    expect(currentTab(pages, "/api-reference/health/get")).toBe("API reference");
  });

  it("is the API reference on its overview page", () => {
    expect(currentTab(pages, "/api-reference")).toBe("API reference");
  });

  it("falls back to the first tab for an unknown pathname", () => {
    expect(currentTab(pages, "/missing")).toBe("Guides");
  });
});
