import { describe, expect, it } from "vitest";
import { splitDescription } from "@/lib/docs/ui/splitDescription";

describe("splitDescription", () => {
  it("uses the first paragraph as the lead and keeps the rest", () => {
    expect(splitDescription("First line.\n\nSecond paragraph.\n\n| a | b |")).toEqual({ lead: "First line.", rest: "Second paragraph.\n\n| a | b |" });
  });

  it("handles a single paragraph and an empty description", () => {
    expect(splitDescription("Only one.")).toEqual({ lead: "Only one.", rest: "" });
    expect(splitDescription(undefined)).toEqual({ lead: "", rest: "" });
  });

  it("does not use a table as the lead", () => {
    expect(splitDescription("| a | b |\n| --- | --- |")).toEqual({ lead: "", rest: "| a | b |\n| --- | --- |" });
  });
});
