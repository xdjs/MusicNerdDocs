import { describe, expect, it } from "vitest";
import { splitPathSegments } from "@/lib/docs/ui/splitPathSegments";

describe("splitPathSegments", () => {
  it("splits a path into its segments and marks the parameters", () => {
    expect(splitPathSegments("/api/artist/{id}/research/refresh")).toEqual([
      { text: "api", param: false },
      { text: "artist", param: false },
      { text: "{id}", param: true },
      { text: "research", param: false },
      { text: "refresh", param: false },
    ]);
  });

  it("returns nothing for the root path", () => {
    expect(splitPathSegments("/")).toEqual([]);
  });
});
