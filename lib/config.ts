import { apiUrlForEnv } from "./apiUrlForEnv.ts";

/**
 * Production uses the public docs domain. Explicit overrides and non-production
 * Vercel/local URL selection remain available for development.
 */
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteConfig = {
  name: "Music Nerd",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? "https://docs.musicnerd.net"
      : vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000"),
  /** The API that Try it, the reference curl and llms.txt use: production for the production docs, staging otherwise. */
  apiUrl: apiUrlForEnv(process.env.VERCEL_ENV),
  appUrl: "https://www.musicnerd.xyz",
  apiRepoUrl: "https://github.com/xdjs/MusicNerdAPI",
  docsRepoUrl: "https://github.com/xdjs/MusicNerdDocs",
  issuesUrl: "https://github.com/xdjs/MusicNerdWeb/issues",
};
