import type { MetadataRoute } from "next";
import { absoluteUrl } from "./absoluteUrl.ts";

/** Lets every crawler in and points it to the sitemap. */
export function docsRobots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
