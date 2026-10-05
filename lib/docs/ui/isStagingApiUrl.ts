/** True when the docs call the staging API (previews, local development), so Try it can say so. */
export function isStagingApiUrl(apiUrl: string): boolean {
  return apiUrl.includes("-staging.");
}
