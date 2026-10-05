"use client";
import { useId, useState, type KeyboardEvent } from "react";
import type { ResponseExample } from "@/lib/docs/ui/responseExamples";
import { DocsCode } from "./docs-interactive";

/** The example responses beside the reference, one tab per status. */
export function ResponseExamplesCard({ examples }: { examples: ResponseExample[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  if (!examples.length) return null;
  const example = examples[active];
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % examples.length : event.key === "ArrowLeft" ? (index - 1 + examples.length) % examples.length : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`${id}-${next}`)?.focus();
  }
  const tabs = (
    <span role="tablist" aria-label="Example responses" className="mn-status-tabs">
      {examples.map((item, index) => (
        <button key={item.status} id={`${id}-${index}`} type="button" role="tab" aria-selected={index === active} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => onKey(event, index)}>{item.status}</button>
      ))}
    </span>
  );
  const language = example.body.trim().startsWith("{") || example.body.trim().startsWith("[") ? "json" : "text";
  return <DocsCode key={example.status} language={language} label={`${example.status} response example`} heading={tabs}>{example.body}</DocsCode>;
}
