import { resolveReference, schemaExample, type ApiObject } from "@/lib/docs-server";

export type ResponseExample = { status: string; body: string };

/** One example body per response status, for the example card beside the reference: named examples, then an example, then one built from the schema. */
export function responseExamples(operation: ApiObject, spec: ApiObject): ResponseExample[] {
  return Object.entries(operation.responses ?? {}).flatMap(([status, raw]) => {
    const content: ApiObject = resolveReference(raw as ApiObject, spec).content ?? {};
    const media: ApiObject | undefined = content["application/json"] ?? Object.values(content)[0];
    if (!media) return [];
    const named = media.examples ? resolveReference(Object.values(media.examples)[0] as ApiObject, spec).value : undefined;
    const value = named ?? media.example ?? (media.schema ? schemaExample(media.schema, spec) : undefined);
    if (value === undefined) return [];
    return [{ status, body: typeof value === "string" ? value : JSON.stringify(value, null, 2) }];
  });
}
