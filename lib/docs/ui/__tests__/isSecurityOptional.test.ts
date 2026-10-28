import { describe, expect, it } from "vitest";
import { isSecurityOptional } from "@/lib/docs/ui/isSecurityOptional";

describe("isSecurityOptional", () => {
  it("is true when one alternative is empty, so a credential may be left out", () => {
    expect(isSecurityOptional([{ privyBearer: [] }, {}])).toBe(true);
  });

  it("is false when every alternative names a scheme", () => {
    expect(isSecurityOptional([{ privyBearer: [] }])).toBe(false);
  });

  it("is false for a public or undeclared operation", () => {
    expect(isSecurityOptional([])).toBe(false);
    expect(isSecurityOptional(undefined)).toBe(false);
  });
});
