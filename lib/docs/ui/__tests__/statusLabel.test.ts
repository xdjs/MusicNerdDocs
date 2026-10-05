import { describe, expect, it } from "vitest";
import { statusLabel } from "@/lib/docs/ui/statusLabel";

describe("statusLabel", () => {
  it("uses the response's own status text when it has one", () => {
    expect(statusLabel(418, "Teapot")).toBe("Teapot");
  });

  it("names the statuses the API returns when the text is empty (HTTP/2 sends none)", () => {
    expect(statusLabel(200, "")).toBe("OK");
    expect(statusLabel(401, "")).toBe("Unauthorized");
    expect(statusLabel(403, "")).toBe("Forbidden");
    expect(statusLabel(500, "")).toBe("Internal Server Error");
  });

  it("falls back to a generic word for anything else", () => {
    expect(statusLabel(299, "")).toBe("Response");
  });
});
