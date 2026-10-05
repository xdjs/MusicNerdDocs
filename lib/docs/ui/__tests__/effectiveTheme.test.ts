import { describe, expect, it } from "vitest";
import { effectiveTheme } from "@/lib/docs/ui/effectiveTheme";

describe("effectiveTheme", () => {
  it("uses the visitor's saved choice", () => {
    expect(effectiveTheme("light", true)).toBe("light");
    expect(effectiveTheme("dark", false)).toBe("dark");
  });

  it("follows the system without a saved choice", () => {
    expect(effectiveTheme(null, true)).toBe("dark");
    expect(effectiveTheme(null, false)).toBe("light");
    expect(effectiveTheme("sepia", true)).toBe("dark");
  });
});
