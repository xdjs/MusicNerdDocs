import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const request = (path: string, accept?: string) => new NextRequest(`https://docs.musicnerd.xyz${path}`, { headers: accept ? { accept } : {} });

describe("proxy", () => {
  it("rewrites markdown requests to the raw handler", () => {
    const response = proxy(request("/quickstart", "text/markdown"));
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://docs.musicnerd.xyz/raw/quickstart.md");
    expect(proxy(request("/quickstart.md")).headers.get("x-middleware-rewrite")).toBe("https://docs.musicnerd.xyz/raw/quickstart.md");
  });

  it("passes browser requests through untouched", () => {
    const response = proxy(request("/quickstart", "text/html,*/*;q=0.8"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("vary")).toBeNull();
  });
});
