import { discoveryHeaders } from "./discoveryHeaders.ts";

/** CORS preflight for the machine-readable routes. */
export function discoveryOptions() {
  return new Response(null, { status: 204, headers: discoveryHeaders("text/plain; charset=utf-8") });
}
