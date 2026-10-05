import { describe, expect, it } from "vitest";
import { apiUrlForEnv } from "@/lib/apiUrlForEnv";

describe("apiUrlForEnv", () => {
  it("points the production docs at the production API", () => {
    expect(apiUrlForEnv("production")).toBe("https://musicnerd-api.vercel.app");
  });

  it("points previews and local development at the staging API, where the example IDs live", () => {
    expect(apiUrlForEnv("preview")).toBe("https://musicnerd-api-staging.vercel.app");
    expect(apiUrlForEnv("development")).toBe("https://musicnerd-api-staging.vercel.app");
    expect(apiUrlForEnv(undefined)).toBe("https://musicnerd-api-staging.vercel.app");
  });
});
