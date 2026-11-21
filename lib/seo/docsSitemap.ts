import type { MetadataRoute } from "next";
import { docsRoutes } from "../docs.ts";
import { absoluteUrl } from "./absoluteUrl.ts";

/** Every docs page on the canonical domain, for search engines. */
export function docsSitemap(): MetadataRoute.Sitemap {
  return docsRoutes.map((route) => ({ url: absoluteUrl(route) }));
}
