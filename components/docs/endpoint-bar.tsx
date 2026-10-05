import { splitPathSegments } from "@/lib/docs/ui/splitPathSegments";
import { MethodPill } from "./method-pill";

/** The endpoint's method and path, segment by segment with its parameters as chips. `values` fills parameters in (Try it). */
export function EndpointPath({ method, path, values = {}, badge }: { method: string; path: string; values?: Record<string, string>; badge?: string }) {
  return (
    <div className="mn-endpoint-path">
      <MethodPill method={method} />
      {badge && <span className="mn-badge">{badge}</span>}
      <code>
        {splitPathSegments(path).map((segment, index) => (
          <span key={index}>
            <span className="mn-path-sep">/</span>
            {segment.param ? <span className="mn-path-param">{values[segment.text.slice(1, -1)] || segment.text}</span> : segment.text}
          </span>
        ))}
      </code>
    </div>
  );
}
