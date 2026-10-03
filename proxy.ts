import { NextResponse, type NextRequest } from "next/server";
import { negotiateDocsMarkdown } from "@/lib/docs/negotiateDocsMarkdown";

/**
 * Serves documentation pages as markdown to clients that ask for it, the way
 * Mintlify does. Browser requests pass through unchanged; the Vary: Accept
 * header comes from next.config.ts (docsVaryHeader).
 */
export function proxy(request: NextRequest) {
  const target = negotiateDocsMarkdown(request.nextUrl.pathname, request.headers.get("accept"));
  return target ? NextResponse.rewrite(new URL(target, request.url)) : NextResponse.next();
}

export const config = { matcher: "/((?!_next/|raw/|spec/|llms|favicon).*)" };
