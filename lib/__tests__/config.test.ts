import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("uses the custom docs domain in production even with the old Vercel hostname", async () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "musicnerd-docs.vercel.app");
  const { siteConfig } = await import("../config");
  expect(siteConfig.url).toBe("https://docs.musicnerd.net");
});

it("preserves the explicit site URL override", async () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test");
  const { siteConfig } = await import("../config");
  expect(siteConfig.url).toBe("https://docs.example.test");
});

it("preserves local development without Vercel configuration", async () => {
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  const { siteConfig } = await import("../config");
  expect(siteConfig.url).toBe("http://localhost:3000");
});
