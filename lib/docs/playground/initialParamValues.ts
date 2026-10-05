import type { PlaygroundParam } from "./types";

/**
 * The playground's starting field values: each parameter's spec example, so the
 * value a visitor sees is the value that is sent. Fields without one start empty.
 */
export function initialParamValues(parameters: PlaygroundParam[]): Record<string, string> {
  return Object.fromEntries(parameters.filter((param) => param.example).map((param) => [`${param.in}:${param.name}`, param.example]));
}
