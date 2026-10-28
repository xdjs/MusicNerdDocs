import { describe, expect, it } from "vitest";
import { isExternalHref } from "@/lib/docs/ui/isExternalHref";

describe("isExternalHref", () => {
  it("is true for a link to another site, so it opens in a new tab", () => {
    expect(isExternalHref("https://musicnerd.net/access")).toBe(true);
    expect(isExternalHref("http://example.com")).toBe(true);
  });

  it("is false for docs pages and anchors", () => {
    expect(isExternalHref("/api-reference/chat/artist-chat")).toBe(false);
    expect(isExternalHref("#authorizations")).toBe(false);
    expect(isExternalHref("mailto:hi@example.com")).toBe(false);
  });
});
