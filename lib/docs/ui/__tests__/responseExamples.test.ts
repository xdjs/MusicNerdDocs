import { describe, expect, it } from "vitest";
import { responseExamples } from "@/lib/docs/ui/responseExamples";

const spec = {
  components: {
    schemas: { Error: { type: "object", required: ["status", "error"], properties: { status: { type: "string", example: "error" }, error: { type: "string", example: "Not signed in" } } } },
    examples: { Ok: { value: { status: "ok", message: "Started" } } },
  },
};

describe("responseExamples", () => {
  it("gives one JSON example per status, from examples, an example or the schema", () => {
    const operation = {
      responses: {
        "200": { content: { "application/json": { examples: { ok: { $ref: "#/components/examples/Ok" } } } } },
        "400": { content: { "application/json": { example: { status: "error", error: "Bad id" } } } },
        "401": { content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    };
    expect(responseExamples(operation, spec)).toEqual([
      { status: "200", body: '{\n  "status": "ok",\n  "message": "Started"\n}' },
      { status: "400", body: '{\n  "status": "error",\n  "error": "Bad id"\n}' },
      { status: "401", body: '{\n  "status": "error",\n  "error": "Not signed in"\n}' },
    ]);
  });

  it("skips statuses without a body and shows a stream as text", () => {
    const operation = {
      responses: {
        "200": { content: { "text/event-stream": { example: "event: done\ndata: {}" } } },
        "204": { description: "No content" },
      },
    };
    expect(responseExamples(operation, spec)).toEqual([{ status: "200", body: "event: done\ndata: {}" }]);
  });
});
