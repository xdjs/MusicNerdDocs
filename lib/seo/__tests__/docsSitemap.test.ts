import { expect, it } from "vitest";
import { docsSitemap } from "../docsSitemap";
import { absoluteUrl } from "../absoluteUrl";

it("lists every docs route as an absolute URL", () => {
  const urls = docsSitemap().map((entry) => entry.url);
  expect(urls).toContain(absoluteUrl("/"));
  expect(urls).toContain(absoluteUrl("/api-reference"));
  expect(urls).toContain(absoluteUrl("/mcp"));
  expect(new Set(urls).size).toBe(urls.length);
});
