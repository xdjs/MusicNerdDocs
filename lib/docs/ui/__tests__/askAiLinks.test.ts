import { describe, expect, it } from "vitest";
import { askAiLinks } from "@/lib/docs/ui/askAiLinks";

describe("askAiLinks", () => {
  it("opens ChatGPT on the page and Claude and Perplexity on its Markdown, as Mintlify does", () => {
    expect(askAiLinks("https://docs.example.dev/api-reference/health/get")).toEqual([
      { name: "ChatGPT", href: "https://chat.openai.com/?hints=search&q=Read%20from%20https%3A%2F%2Fdocs.example.dev%2Fapi-reference%2Fhealth%2Fget%20so%20I%20can%20ask%20questions%20about%20it." },
      { name: "Claude", href: "https://claude.ai/new?q=Read%20from%20https%3A%2F%2Fdocs.example.dev%2Fapi-reference%2Fhealth%2Fget.md%20so%20I%20can%20ask%20questions%20about%20it." },
      { name: "Perplexity", href: "https://www.perplexity.ai/search?q=Read%20from%20https%3A%2F%2Fdocs.example.dev%2Fapi-reference%2Fhealth%2Fget.md%20so%20I%20can%20ask%20questions%20about%20it." },
    ]);
  });

  it("uses /index.md for the home page", () => {
    expect(askAiLinks("https://docs.example.dev/")[1].href).toContain(encodeURIComponent("https://docs.example.dev/index.md"));
  });
});
