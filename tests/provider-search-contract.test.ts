import { describe, expect, it } from "vitest";
import artistLookups from "../content/source/api-reference/openapi/artist-lookups.json";

describe("provider identity search contract", () => {
  it.each(["spotify", "deezer"])("represents an external %s result", platform => {
    const schema = artistLookups.components.schemas.ExternalArtistResult;
    const platformSchema = schema.properties.platform as { type: string; const?: string; enum?: string[] };
    expect(platformSchema.type).toBe("string");
    expect(platformSchema.const).toBeUndefined();
    expect(platformSchema.enum).toContain(platform);
    expect(schema.properties.id.type).toBe("null");
    expect(schema.properties.imageUrl.type).toContain("null");
  });
});
