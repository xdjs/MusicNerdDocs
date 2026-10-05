import { describe, expect, it } from "vitest";
import { negotiateDocsMarkdown } from "@/lib/docs/negotiateDocsMarkdown";

describe("negotiateDocsMarkdown", () => {
  it("rewrites a docs page to its raw markdown when the client accepts text/markdown", () => {
    expect(negotiateDocsMarkdown("/quickstart", "text/markdown")).toBe("/raw/quickstart.md");
    expect(negotiateDocsMarkdown("/api-reference/health/get", "text/markdown;q=0.9, */*;q=0.1")).toBe("/raw/api-reference/health/get.md");
  });

  it("rewrites when text/plain is accepted without text/html", () => {
    expect(negotiateDocsMarkdown("/quickstart", "text/plain")).toBe("/raw/quickstart.md");
    expect(negotiateDocsMarkdown("/quickstart", "text/html, text/plain")).toBeNull();
  });

  it("honours q-values: a rejected type never selects markdown", () => {
    expect(negotiateDocsMarkdown("/quickstart", "text/markdown;q=0")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", "text/markdown;q=0, text/html")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", "text/plain;q=0, */*")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", "text/plain;q=0")).toBeNull();
  });

  it("honours q-value ordering between text/plain and text/html", () => {
    expect(negotiateDocsMarkdown("/quickstart", "text/plain;q=1, text/html;q=0.9")).toBe("/raw/quickstart.md");
    expect(negotiateDocsMarkdown("/quickstart", "text/html;q=0.9, text/plain")).toBe("/raw/quickstart.md");
    expect(negotiateDocsMarkdown("/quickstart", "text/plain;q=0.9, text/html")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", "text/html, text/markdown;q=0.5")).toBeNull();
  });

  it("parses media types case-insensitively with surrounding whitespace", () => {
    expect(negotiateDocsMarkdown("/quickstart", " TEXT/Markdown ; Q=0.8 , text/html;q=0.7")).toBe("/raw/quickstart.md");
  });

  it("rewrites a .md suffix regardless of the Accept header", () => {
    expect(negotiateDocsMarkdown("/quickstart.md", null)).toBe("/raw/quickstart.md");
    expect(negotiateDocsMarkdown("/quickstart.md", "text/html")).toBe("/raw/quickstart.md");
  });

  it("maps the docs index to the raw index page", () => {
    expect(negotiateDocsMarkdown("/", "text/markdown")).toBe("/raw/index.md");
    expect(negotiateDocsMarkdown("/", "text/markdown")).toBe("/raw/index.md");
  });

  it("leaves browser requests and wildcard accepts alone", () => {
    expect(negotiateDocsMarkdown("/quickstart", "text/html,application/xhtml+xml,*/*;q=0.8")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", "*/*")).toBeNull();
    expect(negotiateDocsMarkdown("/quickstart", null)).toBeNull();
  });

  it("never rewrites the raw, spec, machine-readable or api-reference overview paths", () => {
    expect(negotiateDocsMarkdown("/raw/quickstart.md", "text/markdown")).toBeNull();
    expect(negotiateDocsMarkdown("/spec/health.json", "text/markdown")).toBeNull();
    expect(negotiateDocsMarkdown("/api-reference", "text/markdown")).toBeNull();
    expect(negotiateDocsMarkdown("/llms.txt", "text/markdown")).toBeNull();
    expect(negotiateDocsMarkdown("/llms-full.txt", "text/plain")).toBeNull();
    expect(negotiateDocsMarkdown("/_next/static/chunk.js", "text/plain")).toBeNull();
  });
});
