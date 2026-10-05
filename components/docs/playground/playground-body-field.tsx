"use client";
import { useId } from "react";

/** The request body editor in Try it. */
export function PlaygroundBodyField({ contentType, value, onChange }: { contentType: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <details className="mn-field-card" open>
      <summary>Body</summary>
      <div className="mn-field-body">
        <label htmlFor={id} className="mn-chips"><code>body</code><span>{contentType}</span></label>
        <textarea id={id} value={value} spellCheck={false} onChange={(event) => onChange(event.target.value)} />
      </div>
    </details>
  );
}
