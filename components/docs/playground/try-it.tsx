"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildPlaygroundCurl } from "@/lib/docs/playground/buildPlaygroundCurl";
import { buildPlaygroundRequest } from "@/lib/docs/playground/buildPlaygroundRequest";
import { initialParamValues } from "@/lib/docs/playground/initialParamValues";
import { listMissingParams } from "@/lib/docs/playground/listMissingParams";
import { sendPlaygroundRequest } from "@/lib/docs/playground/sendPlaygroundRequest";
import type { PlaygroundOperation, PlaygroundResult } from "@/lib/docs/playground/types";
import { closeOnBackdrop } from "../close-on-backdrop";
import { DocsCode } from "../docs-interactive";
import { EndpointPath } from "../endpoint-bar";
import { MethodPill } from "../method-pill";
import { PlaygroundBodyField } from "./playground-body-field";
import { PlaygroundKeyField } from "./playground-key-field";
import { PlaygroundParamFields } from "./playground-param-fields";
import { PlaygroundResponse } from "./playground-response";
import { useStoredApiKey } from "./use-stored-api-key";
import "./api-playground.css";

const HASH = "#try-it";

function invalidJson(body: string): string | null {
  try {
    JSON.parse(body);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

type Endpoint = { href: string; title: string; method: string };

/**
 * The Try it button and its window: fields beside their descriptions, the live curl and the
 * response. It opens on `#try-it` (the endpoint switcher navigates there) and closes on a tap
 * outside or Escape, as Mintlify's does.
 */
export function TryIt({ operation, baseUrl, staging, title, lead, endpoints }: { operation: PlaygroundOperation; baseUrl: string; staging: boolean; title: string; lead: string; endpoints: Endpoint[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [params, setParams] = useState<Record<string, string>>(() => initialParamValues(operation.parameters));
  const [body, setBody] = useState(operation.body?.example ?? "");
  const [apiKey, setApiKey] = useStoredApiKey();
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [pending, setPending] = useState(false);
  const request = buildPlaygroundRequest(operation, { params, body, apiKey }, baseUrl);
  const pathValues = Object.fromEntries(operation.parameters.filter((param) => param.in === "path").map((param) => [param.name, params[`path:${param.name}`] ?? ""]));

  useEffect(() => {
    if (window.location.hash === HASH && !dialog.current?.open) dialog.current?.showModal();
  }, []);

  function open() {
    dialog.current?.showModal();
  }
  function onClose() {
    if (window.location.hash === HASH) history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  async function send() {
    const missing = listMissingParams(operation.parameters, params);
    if (missing.length) return setResult({ error: `Fill in the required ${missing.length === 1 ? "parameter" : "parameters"}: ${missing.join(", ")}`, elapsedMs: 0 });
    const problem = operation.body?.contentType === "application/json" && body.trim() ? invalidJson(body) : null;
    if (problem) return setResult({ error: `Request body is not valid JSON: ${problem}`, elapsedMs: 0 });
    setPending(true);
    setResult(await sendPlaygroundRequest(request));
    setPending(false);
  }
  const setParam = (key: string, value: string) => setParams((current) => ({ ...current, [key]: value }));

  return (
    <>
      <button type="button" className="mn-button mn-tryit-open" onClick={open}>
        Try it
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
      </button>
      <dialog ref={dialog} className="mn-tryit" aria-label={`Try it: ${title}`} onClick={(event) => closeOnBackdrop(event, () => dialog.current?.close())} onClose={onClose}>
        <div className="mn-tryit-body">
          <div className="mn-tryit-bar">
            <label className="mn-endpoint-switch">
              <span className="mn-sr-only">Endpoint</span>
              <MethodPill method={operation.method} />
              <select value={pathname} onChange={(event) => router.push(event.target.value + HASH)}>
                {endpoints.map((endpoint) => <option key={endpoint.href} value={endpoint.href}>{endpoint.title}</option>)}
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </label>
            <EndpointPath method={operation.method} path={operation.path} values={pathValues} badge={staging ? "staging" : undefined} />
            {operation.runnable && (
              <button type="button" className="mn-button mn-send" onClick={send} disabled={pending}>
                {pending ? "Sending" : "Send"}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
              </button>
            )}
          </div>
          <div className="mn-tryit-grid">
            <div className="mn-tryit-fields">
              {lead && <p className="mn-tryit-lead">{lead}</p>}
              {!operation.runnable && <p className="mn-tryit-note">This one can’t run in the browser. Copy the curl and run it from a terminal.</p>}
              <PlaygroundKeyField auth={operation.auth} description={operation.authDescription} value={apiKey} onChange={setApiKey} />
              <PlaygroundParamFields title="Path" parameters={operation.parameters.filter((param) => param.in === "path")} values={params} onChange={setParam} />
              <PlaygroundParamFields title="Query" parameters={operation.parameters.filter((param) => param.in === "query")} values={params} onChange={setParam} />
              <PlaygroundParamFields title="Headers" parameters={operation.parameters.filter((param) => param.in === "header")} values={params} onChange={setParam} />
              {operation.body && <PlaygroundBodyField contentType={operation.body.contentType} value={body} onChange={setBody} />}
            </div>
            <div className="mn-tryit-side">
              <DocsCode language="bash" label="cURL">{buildPlaygroundCurl(request)}</DocsCode>
              <PlaygroundResponse result={result} pending={pending} />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
