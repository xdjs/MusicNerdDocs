"use client";
import type { PlaygroundResult } from "@/lib/docs/playground/types";
import { DocsCode } from "../docs-interactive";

/** The live response in Try it: status, time and body, or a prompt to send. */
export function PlaygroundResponse({ result, pending }: { result: PlaygroundResult | null; pending: boolean }) {
  return (
    <div className="mn-tryit-response" aria-live="polite">
      {pending && <p className="mn-tryit-note">Sending request</p>}
      {!pending && !result && <p className="mn-tryit-note">Send the request to see the live response here.</p>}
      {!pending && result && "error" in result && <p className="mn-tryit-error">{result.error}</p>}
      {!pending && result && "status" in result && (
        <>
          <DocsCode
            language={result.isJson ? "json" : "text"}
            label={`Response ${result.status}`}
            heading={<span className="mn-response-head"><b className={result.status < 300 ? "mn-ok" : "mn-bad"}>{result.status}</b> {result.statusText || "Response"} · {result.elapsedMs} ms <i>live</i></span>}
          >
            {result.body || "(empty body)"}
          </DocsCode>
          <details className="mn-response-headers">
            <summary>Response headers ({result.headers.length})</summary>
            <dl>
              {result.headers.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
            </dl>
          </details>
        </>
      )}
    </div>
  );
}
