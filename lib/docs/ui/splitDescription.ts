/** An operation description as the page's lead (its first paragraph) and the rest. A table never becomes the lead. */
export function splitDescription(text: string | undefined): { lead: string; rest: string } {
  const paragraphs = (text ?? "").trim().split(/\n\s*\n/).filter(Boolean);
  if (!paragraphs.length || paragraphs[0].trim().startsWith("|")) return { lead: "", rest: paragraphs.join("\n\n") };
  return { lead: paragraphs[0], rest: paragraphs.slice(1).join("\n\n") };
}
