import { apiUrlForEnv } from "./apiUrlForEnv.ts";

/**
 * Site-wide values. The canonical URL comes from NEXT_PUBLIC_SITE_URL once the
 * docs have their own domain; until then Vercel's production URL, then local.
 */
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteConfig = {
  name: "Music Nerd",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000"),
  /** The API that Try it, the reference curl and llms.txt use: production for the production docs, staging otherwise. */
  apiUrl: apiUrlForEnv(process.env.VERCEL_ENV),
  appUrl: "https://www.musicnerd.xyz",
  apiRepoUrl: "https://github.com/xdjs/MusicNerdAPI",
  docsRepoUrl: "https://github.com/xdjs/MusicNerdDocs",
  issuesUrl: "https://github.com/xdjs/MusicNerdWeb/issues",
};
