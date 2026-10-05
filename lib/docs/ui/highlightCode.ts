export type CodeToken = { text: string; kind?: "keyword" | "flag" | "key" | "string" | "literal" };

const JSON_TOKEN = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b/g;

function push(tokens: CodeToken[], text: string, kind?: CodeToken["kind"]) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (!kind && last && !last.kind) last.text += text;
  else tokens.push(kind ? { text, kind } : { text });
}

function highlightJson(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let index = 0;
  for (const match of code.matchAll(JSON_TOKEN)) {
    push(tokens, code.slice(index, match.index));
    const text = match[0];
    const isKey = text.startsWith('"') && /^\s*:/.test(code.slice(match.index + text.length));
    push(tokens, text, isKey ? "key" : text.startsWith('"') ? "string" : "literal");
    index = match.index + text.length;
  }
  push(tokens, code.slice(index));
  return tokens;
}

function highlightBash(code: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let quoted = false;
  for (let index = 0; index < code.length; ) {
    const char = code[index];
    const wordStart = !quoted && !/\s/.test(char) && char !== "'" && (index === 0 || /\s/.test(code[index - 1]));
    if (!wordStart) {
      if (char === "'") quoted = !quoted;
      push(tokens, char);
      index += 1;
      continue;
    }
    let end = index;
    while (end < code.length && !/\s/.test(code[end]) && code[end] !== "'") end += 1;
    const word = code.slice(index, end);
    push(tokens, word, word === "curl" ? "keyword" : /^--?[A-Za-z]/.test(word) ? "flag" : undefined);
    index = end;
  }
  return tokens;
}

/** Splits a code sample into coloured tokens. Only the languages the docs show (bash, JSON) are coloured. */
export function highlightCode(code: string, language: string): CodeToken[] {
  if (language === "json") return highlightJson(code);
  if (language === "bash" || language === "sh" || language === "shell") return highlightBash(code);
  return [{ text: code }];
}
