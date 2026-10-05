import { describe, expect, it } from "vitest";
import { initialParamValues } from "@/lib/docs/playground/initialParamValues";
import type { PlaygroundParam } from "@/lib/docs/playground/types";

const param = (overrides: Partial<PlaygroundParam>): PlaygroundParam => ({ name: "id", in: "path", required: true, type: "string", example: "", description: "", ...overrides });

describe("initialParamValues", () => {
  it("starts each field with its spec example, keyed by location and name", () => {
    expect(initialParamValues([param({ example: "aab92f80" }), param({ name: "limit", in: "query", required: false, example: "5" })])).toEqual({ "path:id": "aab92f80", "query:limit": "5" });
  });

  it("leaves fields without an example empty, so a required one still has to be filled", () => {
    expect(initialParamValues([param({ example: "" })])).toEqual({});
  });
});
