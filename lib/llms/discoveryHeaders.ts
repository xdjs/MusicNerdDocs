import { absoluteUrl } from "../seo/absoluteUrl.ts";

/** Headers for the machine-readable routes: cacheable, open to any origin, pointing at each other. */
export function discoveryHeaders(contentType: string) {
  return {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Expose-Headers": "Link",
    "X-Content-Type-Options": "nosniff",
    Link: `<${absoluteUrl("/llms.txt")}>; rel="describedby"; type="text/plain", <${absoluteUrl("/llms-full.txt")}>; rel="alternate"; type="text/plain"`,
  };
}
