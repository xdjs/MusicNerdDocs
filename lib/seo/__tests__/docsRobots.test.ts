import { expect, it } from "vitest";
import { docsRobots } from "../docsRobots";
import { absoluteUrl } from "../absoluteUrl";

it("allows crawling and points to the sitemap", () => {
  expect(docsRobots()).toEqual({ rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") });
});
