/**
 * Whether a resolved docs link leaves the docs site, so it opens in a new tab.
 *
 * @param href - The link after `resolveDocsHref`, which turns docs-site URLs into paths.
 * @returns True for an `http(s)` URL.
 */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}
