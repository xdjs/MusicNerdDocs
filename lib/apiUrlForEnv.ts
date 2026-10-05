const PRODUCTION_API_URL = "https://musicnerd-api.vercel.app";
const STAGING_API_URL = "https://musicnerd-api-staging.vercel.app";

/**
 * The MusicNerdAPI these docs call, chosen by the deployment: the production
 * docs call production; previews and local development call staging, on the
 * staging database where the example artist IDs live. The docs URL decides
 * the environment, the way MusicNerdWeb chooses its API.
 */
export function apiUrlForEnv(vercelEnv: string | undefined): string {
  return vercelEnv === "production" ? PRODUCTION_API_URL : STAGING_API_URL;
}
