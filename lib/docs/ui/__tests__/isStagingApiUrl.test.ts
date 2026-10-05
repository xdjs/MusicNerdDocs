import { describe, expect, it } from "vitest";
import { isStagingApiUrl } from "@/lib/docs/ui/isStagingApiUrl";
import { apiUrlForEnv } from "@/lib/apiUrlForEnv";

describe("isStagingApiUrl", () => {
  it("is true for the API previews and local development call", () => {
    expect(isStagingApiUrl(apiUrlForEnv("preview"))).toBe(true);
  });

  it("is false for production", () => {
    expect(isStagingApiUrl(apiUrlForEnv("production"))).toBe(false);
  });
});
