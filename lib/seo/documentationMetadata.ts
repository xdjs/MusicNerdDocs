import type { Metadata } from "next";
import type { DocPage } from "../docs.ts";
import { docHref } from "../docs-paths.ts";
import { absoluteUrl } from "./absoluteUrl.ts";

/** Page metadata: title, description, canonical URL and the page's Markdown alternate. */
export function documentationMetadata(page: DocPage | undefined, key: string): Metadata {
  const title = page?.title || "API reference";
  const description = page?.description || "Every Music Nerd API endpoint, with request examples and a live playground.";
  const url = absoluteUrl(docHref(key));
  return {
    title: key ? `${title} | Music Nerd Docs` : "Music Nerd Docs",
    description,
    alternates: {
      canonical: url,
      ...(key !== "api-reference" ? { types: { "text/markdown": absoluteUrl(`/raw/${key || "index"}.md`) } } : {}),
    },
    openGraph: { title: `${title} | Music Nerd Docs`, description, url, siteName: "Music Nerd Docs", locale: "en_US", type: "website" },
  };
}
