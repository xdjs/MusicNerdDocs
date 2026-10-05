"use client";
import { useId, useState, type ReactNode } from "react";

/** The Response section: a status picker and that status's body fields. Panels are rendered on the server. */
export function ResponseSwitcher({ responses }: { responses: { status: string; mediaType?: string; panel: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  if (!responses.length) return null;
  const response = responses[active];
  return (
    <section id="response" className="mn-section">
      <div className="mn-section-head">
        <h2>Response</h2>
        <label className="mn-status-select">
          <span className="mn-sr-only">Status</span>
          <select id={id} value={active} onChange={(event) => setActive(Number(event.target.value))}>
            {responses.map((item, index) => <option key={item.status} value={index}>{item.status}</option>)}
          </select>
        </label>
        {response.mediaType && <span className="mn-media-type">{response.mediaType}</span>}
      </div>
      {response.panel}
    </section>
  );
}
