export type PathSegment = { text: string; param: boolean };

/** The segments of an endpoint path, marking `{param}` ones, for the endpoint bar. */
export function splitPathSegments(path: string): PathSegment[] {
  return path
    .split("/")
    .filter(Boolean)
    .map((text) => ({ text, param: /^\{[^}]+\}$/.test(text) }));
}
