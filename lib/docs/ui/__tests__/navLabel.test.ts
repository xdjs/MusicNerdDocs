import { expect, it } from "vitest";
import { navLabel } from "../navLabel";

it("uses the sidebar title when a page sets one", () => {
  expect(navLabel({ slug: "mcp", title: "Music Nerd MCP", sidebarTitle: "MCP" })).toBe("MCP");
});

it("falls back to the page title", () => {
  expect(navLabel({ slug: "quickstart", title: "Quickstart" })).toBe("Quickstart");
});

it("labels the home page Introduction", () => {
  expect(navLabel({ slug: "", title: "Music Nerd API" })).toBe("Introduction");
});
