import { describe, expect, it } from "vitest";
import { highlightCode } from "@/lib/docs/ui/highlightCode";

const join = (tokens: { text: string }[]) => tokens.map((token) => token.text).join("");

describe("highlightCode", () => {
  it("marks the curl command and its flags in bash, keeping the text intact", () => {
    const code = "curl --request POST \\\n  --url 'https://x.dev/api' \\\n  -H 'a: b'";
    const tokens = highlightCode(code, "bash");
    expect(join(tokens)).toBe(code);
    expect(tokens.filter((token) => token.kind === "keyword").map((token) => token.text)).toEqual(["curl"]);
    expect(tokens.filter((token) => token.kind === "flag").map((token) => token.text)).toEqual(["--request", "--url", "-H"]);
  });

  it("marks keys, strings and literals in JSON, keeping the text intact", () => {
    const code = '{\n  "status": "ok",\n  "count": 2,\n  "done": true,\n  "next": null\n}';
    const tokens = highlightCode(code, "json");
    expect(join(tokens)).toBe(code);
    expect(tokens.filter((token) => token.kind === "key").map((token) => token.text)).toEqual(['"status"', '"count"', '"done"', '"next"']);
    expect(tokens.filter((token) => token.kind === "string").map((token) => token.text)).toEqual(['"ok"']);
    expect(tokens.filter((token) => token.kind === "literal").map((token) => token.text)).toEqual(["2", "true", "null"]);
  });

  it("leaves other languages as one plain token", () => {
    expect(highlightCode("plain text", "text")).toEqual([{ text: "plain text" }]);
  });
});
