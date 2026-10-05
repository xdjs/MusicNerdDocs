"use client";
import { useId, type ReactNode } from "react";
import type { PlaygroundAuth } from "@/lib/docs/playground/types";

/** The credential field in Try it: the header it fills, its description, and the input with its Bearer prefix. */
export function PlaygroundKeyField({ auth, description, value, onChange }: { auth: PlaygroundAuth; description?: ReactNode; value: string; onChange: (value: string) => void }) {
  const id = useId();
  if (auth.type === "none") return null;
  const header = auth.type === "bearer" ? "Authorization" : auth.header;
  return (
    <details className="mn-field-card" open>
      <summary>Authorization</summary>
      <div className="mn-field-row">
        <div>
          <p className="mn-chips"><code>{header}</code><span>string</span><em>required</em></p>
          <p id={`${id}-hint`}>{description}{description ? " " : ""}Kept in this tab only.</p>
        </div>
        <label className="mn-input-group" htmlFor={id}>
          {auth.type === "bearer" && <span>Bearer</span>}
          <input id={id} type="password" autoComplete="off" spellCheck={false} data-1p-ignore placeholder="enter token" value={value} onChange={(event) => onChange(event.target.value)} aria-label={auth.type === "bearer" ? "Bearer token" : `${header} value`} aria-describedby={`${id}-hint`} />
        </label>
      </div>
    </details>
  );
}
