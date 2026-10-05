const NAMES: Record<number, string> = {
  200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 409: "Conflict", 422: "Unprocessable Content", 429: "Too Many Requests",
  500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout",
};

/** The words after a status code in Try it: the response's own text, else the standard name (HTTP/2 responses carry no reason phrase). */
export function statusLabel(status: number, statusText: string): string {
  return statusText || NAMES[status] || "Response";
}
