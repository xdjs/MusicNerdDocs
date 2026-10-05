const prompt = (url: string) => encodeURIComponent(`Read from ${url} so I can ask questions about it.`);

/** The Copy page menu's "Open in …" links, in Mintlify's format: ChatGPT reads the page, Claude and Perplexity its Markdown. */
export function askAiLinks(pageUrl: string): { name: string; href: string }[] {
  const url = new URL(pageUrl);
  const markdown = `${url.origin}${url.pathname === "/" ? "/index" : url.pathname.replace(/\/$/, "")}.md`;
  return [
    { name: "ChatGPT", href: `https://chat.openai.com/?hints=search&q=${prompt(`${url.origin}${url.pathname}`)}` },
    { name: "Claude", href: `https://claude.ai/new?q=${prompt(markdown)}` },
    { name: "Perplexity", href: `https://www.perplexity.ai/search?q=${prompt(markdown)}` },
  ];
}
