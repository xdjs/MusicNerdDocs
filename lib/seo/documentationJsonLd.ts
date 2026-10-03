import type { DocPage } from "../docs.ts";
import { docHref } from "../docs-paths.ts";
import { absoluteUrl } from "./absoluteUrl.ts";

/** Structured data for a page: a TechArticle (or the collection pages) and its breadcrumb trail. */
export function documentationJsonLd(page: DocPage | undefined, key: string) {
  const url = absoluteUrl(docHref(key));
  const title = page?.title || "API reference";
  const collection = !key || key === "api-reference";
  const crumbs = [{ name: "Docs", url: absoluteUrl("/") }];
  if (page?.api) crumbs.push({ name: "API reference", url: absoluteUrl("/api-reference") });
  if (key) crumbs.push({ name: title, url });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": collection ? "CollectionPage" : "TechArticle",
        "@id": collection ? url : `${url}#article`,
        headline: title, name: title, description: page?.description || "", url, inLanguage: "en",
        ...(page && key ? { articleSection: page.category, mainEntityOfPage: { "@type": "WebPage", "@id": url } } : {}),
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: crumb.url })),
      },
    ],
  };
}
