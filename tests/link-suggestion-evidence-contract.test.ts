import { describe, expect, it } from "vitest";
import artistLinks from "../content/source/api-reference/openapi/artist-links.json";

describe("link-suggestion evidence contract", () => {
  it("is additive and explicitly permits unavailable legacy evidence", () => {
    const schema = artistLinks.components.schemas.LinkSuggestion;
    expect(schema.required).not.toContain("evidence");
    expect(schema.properties.evidence.oneOf).toEqual([
      { $ref: "#/components/schemas/LinkSuggestionEvidence" },
      { type: "null" },
    ]);
  });
  it("documents observed fields without a confidence score or model reasoning", () => {
    const schema = artistLinks.components.schemas.LinkSuggestionEvidence;
    expect(schema.required).toEqual(["method", "summary", "artistName", "sourceUrl", "observedTitle"]);
    expect(schema.properties.method.enum).toEqual(["name_handle_probe", "name_web_search"]);
    expect(schema.properties.artistName.maxLength).toBe(500);
    expect(schema.properties.sourceUrl.maxLength).toBe(2048);
    expect(schema.properties.observedTitle.maxLength).toBe(2000);
    expect(schema.properties.observedTitle.type).toContain("null");
    expect(schema.properties).not.toHaveProperty("reasoning");
    expect(schema.properties).not.toHaveProperty("confidence");
  });
  it("shows an old submission and a research candidate with its own recorded observations", () => {
    const examples = artistLinks.paths["/api/artist/{id}/link-suggestions"].get.responses["200"].content["application/json"].example.items;
    expect(examples[0].evidence).toBeNull();
    expect(examples[1].origin).toBe("research");
    expect(examples[1].evidence?.sourceUrl).toBe(examples[1].url);
    expect(examples[1].evidence?.summary).toContain(examples[1].evidence?.artistName);
  });
});
