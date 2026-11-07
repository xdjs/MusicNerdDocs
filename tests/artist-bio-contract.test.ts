import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const spec = JSON.parse(readFileSync(new URL("../content/source/api-reference/openapi/artist-bio.json", import.meta.url), "utf8"));
const operations = spec.paths["/api/artistBio/{id}"];

// #1655: both regeneration entry points share one saved-material contract.
describe("About regeneration contract", () => {
  it.each(["get", "put"])("documents bounded saved-Lore preparation for %s", (method) => {
    const description = operations[method].description;
    expect(description).toContain("missing or stale Lore");
    expect(description).toContain("saved eligible readable material");
    expect(description).toContain("does not start source discovery/extraction");
    expect(description).toContain("Trusted-contributor status alone");
    expect(description).toContain("45-second");
    expect(description).toContain("not a hard wall-clock guarantee");
    expect(description).toContain("check saved state");
    // OpenAPI descriptions support paragraphs and inline formatting, not headings/lists.
    expect(description).not.toMatch(/^#{1,6} /m);
    expect(description).not.toMatch(/^- /m);
  });

  it.each(["get", "put"])("distinguishes unavailable material, busy and stale writes for %s", (method) => {
    const response = operations[method].responses["409"].content["application/json"];
    expect(response.schema.$ref).toBe("#/components/schemas/BioError");
    expect(response.examples.loreRequired.value.code).toBe("LORE_REQUIRED");
    expect(response.examples.loreRequired.value.error).toContain("approved, readable Lore");
    expect(response.examples.lorePreparing.value.code).toBe("LORE_PREPARING");
    expect(response.examples.conflict.value).not.toHaveProperty("code");
  });

  it.each(["get", "put"])("documents partial preparation and settlement failures for %s", (method) => {
    const response = operations[method].responses["500"].content["application/json"];
    expect(response.schema.$ref).toBe("#/components/schemas/BioError");
    expect(response.examples.lorePreparationFailed.value.code).toBe("LORE_PREPARATION_FAILED");
    expect(response.examples.loreSettlementFailed.value.error).toContain("Wait a few minutes");
    expect(response.examples.aboutSettlementFailed.value).not.toHaveProperty("code");
    expect(operations[method].description).toContain("prepared Lore may remain saved");
  });

  it("keeps error codes optional and preserves the distinct read and write response shapes", () => {
    const error = spec.components.schemas.BioError;
    expect(error.required).toEqual(["status", "error"]);
    expect(error.properties.code.enum).toEqual(["LORE_REQUIRED", "LORE_PREPARING", "LORE_PREPARATION_FAILED"]);
    expect(operations.put.security).toEqual([{ privyBearer: [] }]);
    expect(operations.get.security).toEqual([]);
    expect(operations.put.responses["200"].content["application/json"].examples.saved.value).toEqual({ status: "ok", message: "Bio updated" });
    expect(operations.put.responses["200"].content["application/json"].examples.unchanged.value).not.toHaveProperty("pinned");
    expect(operations.get.responses["200"].content["application/json"].examples.pinned.value.pinned).toBe(true);
  });
});
