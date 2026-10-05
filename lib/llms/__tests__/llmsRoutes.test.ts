import { describe, expect, it } from "vitest";
import { GET as getLlms } from "@/app/llms.txt/route";
import { GET as getLlmsFull } from "@/app/llms-full.txt/route";
import { docs } from "@/lib/docs";
import { docsLlmsFullText } from "@/lib/docs/docsLlmsFullText";
import { docHref } from "@/lib/docs-paths";
import { siteConfig } from "@/lib/config";

describe("llms.txt", () => {
  it("names the API, its base URL, and links every documentation page, guides before endpoints", async () => {
    const text = await getLlms().text();
    expect(text.startsWith("# Music Nerd API\n")).toBe(true);
    expect(text).toContain(`API base URL: ${siteConfig.apiUrl}`);
    expect(text.indexOf("## Documentation")).toBeLessThan(text.indexOf("## API reference"));
    for (const page of docs) expect(text).toContain(`(${new URL(docHref(page.slug), siteConfig.url).href})`);
  });
});

describe("llms-full.txt", () => {
  it("is every documentation page's markdown, in navigation order", async () => {
    const text = await getLlmsFull().then(response => response.text());
    expect(text).toBe(await docsLlmsFullText(docs));
    expect(text.match(/^Source: /gm)?.length).toBe(docs.length);
  });
});
