export type PlaygroundParam = {
  name: string;
  in: "path" | "query" | "header";
  required: boolean;
  type: string;
  example: string;
  /** The parameter's description, shown beside its field in Try it. */
  description: string;
};

export type PlaygroundAuth =
  | { type: "apiKey"; header: string }
  | { type: "bearer" }
  | { type: "none" };

/** Serializable summary of one OpenAPI operation, built on the server for the client playground. */
export type PlaygroundOperation = {
  method: string;
  path: string;
  parameters: PlaygroundParam[];
  body?: { contentType: string; example: string };
  auth: PlaygroundAuth;
  /** The credential's description from its security scheme, empty for a public operation. */
  authDescription: string;
  securitySchemes: string[];
  /** False when the browser cannot drive the call (multipart upload, event stream). */
  runnable: boolean;
};

/** What the visitor typed. Params are keyed `${in}:${name}` so path and query names cannot collide. */
export type PlaygroundValues = { params: Record<string, string>; body: string; apiKey: string };

export type PlaygroundRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

export type PlaygroundResponse = {
  status: number;
  statusText: string;
  elapsedMs: number;
  headers: [string, string][];
  body: string;
  isJson: boolean;
};

export type PlaygroundResult = PlaygroundResponse | { error: string; elapsedMs: number };
