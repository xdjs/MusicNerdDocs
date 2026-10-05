/** The coloured HTTP method label used in the sidebar, the endpoint bar and Try it. */
export function MethodPill({ method }: { method: string }) {
  return <span className={`mn-method mn-method-${method.toLowerCase()}`}>{method === "DELETE" ? "DEL" : method}</span>;
}
