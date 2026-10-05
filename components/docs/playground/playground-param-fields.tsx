"use client";
import { useId } from "react";
import type { PlaygroundParam } from "@/lib/docs/playground/types";

/** One card of Try it fields (path, query or headers): each parameter's chips and description beside its input. */
export function PlaygroundParamFields({ title, parameters, values, onChange }: { title: string; parameters: PlaygroundParam[]; values: Record<string, string>; onChange: (key: string, value: string) => void }) {
  const id = useId();
  if (!parameters.length) return null;
  return (
    <details className="mn-field-card" open>
      <summary>{title}</summary>
      {parameters.map((param, index) => {
        const key = `${param.in}:${param.name}`;
        return (
          <div className="mn-field-row" key={key}>
            <div>
              <p className="mn-chips"><code>{param.name}</code><span>{param.type}</span>{param.required && <em>required</em>}</p>
              {param.description && <p id={`${id}-${index}-hint`}>{param.description}</p>}
            </div>
            <input id={`${id}-${index}`} type="text" autoComplete="off" spellCheck={false} value={values[key] ?? ""} placeholder={param.example || param.name} required={param.required} aria-label={param.name} aria-describedby={param.description ? `${id}-${index}-hint` : undefined} onChange={(event) => onChange(key, event.target.value)} />
          </div>
        );
      })}
    </details>
  );
}
