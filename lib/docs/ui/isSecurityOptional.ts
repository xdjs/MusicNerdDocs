/**
 * Whether an operation's credential may be left out: OpenAPI marks optional
 * authentication with an empty alternative, as in `[{ privyBearer: [] }, {}]`.
 *
 * @param security - The operation's (or document's) security requirements.
 * @returns True when one alternative needs no scheme and another needs one.
 */
export function isSecurityOptional(security: Record<string, unknown>[] | undefined): boolean {
  return !!security?.some((item) => Object.keys(item).length === 0) && security.some((item) => Object.keys(item).length > 0);
}
