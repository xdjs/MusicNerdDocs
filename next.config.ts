import type { NextConfig } from "next";
import { docsVaryHeader } from "./lib/docs/docsVaryHeader";

export const nextConfig: NextConfig = {
  devIndicators: false,
  // Specifications are read from disk at request time by the raw and spec routes.
  outputFileTracingIncludes: {
    "/spec/*": ["./content/source/api-reference/openapi/*.json"],
    "/raw/*": ["./content/source/api-reference/openapi/*.json"],
    "/llms-full.txt": ["./content/source/api-reference/openapi/*.json"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Link", value: '</llms.txt>; rel="describedby"; type="text/plain"' },
          ...(process.env.VERCEL_ENV === "preview" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        ],
      },
      docsVaryHeader,
    ];
  },
};

export default nextConfig;
