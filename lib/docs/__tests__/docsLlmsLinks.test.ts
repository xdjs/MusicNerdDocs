import { describe, expect, it } from "vitest";
import { docsLlmsLinks } from "@/lib/docs/docsLlmsLinks";
import { docs } from "@/lib/docs";
import { siteConfig } from "@/lib/config";

const pages = [
  { slug: "", title: "Music Nerd API", description: "Index.", api: undefined },
  { slug: "quickstart", title: "Quickstart", description: "Make a request\nand go.", api: undefined },
  { slug: "api-reference/health/get", title: "Check [health]", description: "Is it up.", api: { method: "GET", path: "/api/health", spec: "health.json" } },
];

describe("docsLlmsLinks", () => {
  it("lists guide pages under Documentation and endpoint pages under API reference", () => {
    const text = docsLlmsLinks(pages);
    const [, guides, api] = text.split(/^## /m);
    expect(guides.startsWith("Documentation\n")).toBe(true);
    expect(api.startsWith("API reference\n")).toBe(true);
    expect(guides).toContain(`- [Music Nerd API](${siteConfig.url}/): Index.`);
    expect(guides).toContain(`- [Quickstart](${siteConfig.url}/quickstart): Make a request and go.`);
    expect(guides).not.toContain("health/get");
    expect(api).toContain(`- [Check \\[health\\]](${siteConfig.url}/api-reference/health/get): Is it up.`);
  });

  it("emits one link per page of the real manifest", () => {
    const text = docsLlmsLinks(docs);
    expect(text.match(/^- \[/gm)?.length).toBe(docs.length);
  });
});
