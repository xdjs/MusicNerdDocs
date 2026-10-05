import { siteConfig } from "../config.ts";
import { absoluteUrl } from "../seo/absoluteUrl.ts";
import { docsLlmsLinks, type DocsLinkPage } from "../docs/docsLlmsLinks.ts";

/** llms.txt: what Music Nerd's API is, where to start, and every documentation page. */
export function getLlmsText(documentation: readonly DocsLinkPage[]): string {
  return `# Music Nerd API

> Music Nerd builds source-backed artist profiles: links, research, Lore, and artists' own interview answers. The Music Nerd API serves that data and runs the research behind it.

## Start here

- [Quickstart](${absoluteUrl("/quickstart")}): Make a first request.
- [Authentication](${absoluteUrl("/authentication")}): Which endpoints are public and which need a Privy access token.
- [Full documentation as one file](${absoluteUrl("/llms-full.txt")}): Every page below as Markdown, in navigation order.
- Every page is also available as Markdown: append \`.md\` to its URL, or request it with \`Accept: text/markdown\`.

API base URL: ${siteConfig.apiUrl}

${docsLlmsLinks(documentation)}
`;
}
