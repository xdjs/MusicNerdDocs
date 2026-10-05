import { siteConfig } from "../config.ts";

/** A site path as an absolute URL on the canonical docs domain. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).href;
}
