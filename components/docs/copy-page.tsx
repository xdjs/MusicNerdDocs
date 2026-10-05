"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { askAiLinks } from "@/lib/docs/ui/askAiLinks";

const copyIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>;
const markdownIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 15V9l2.5 3L11 9v6M16 9v6M14 13l2 2 2-2" /></svg>;
const chatIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>;
const external = <svg className="mn-menu-external" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;

function MenuItem({ icon, title, hint, href, onSelect }: { icon: ReactNode; title: ReactNode; hint: string; href?: string; onSelect?: () => void }) {
  const body = <><span className="mn-menu-icon">{icon}</span><span><strong>{title}</strong><small>{hint}</small></span></>;
  return href
    ? <a role="menuitem" href={href} target="_blank" rel="noopener noreferrer" onClick={onSelect}>{body}</a>
    : <button type="button" role="menuitem" onClick={onSelect}>{body}</button>;
}

/** Copies the page as Markdown, with Mintlify's menu: copy, view as Markdown, and open the page in ChatGPT, Claude or Perplexity. */
export function CopyPage({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const markdownPath = `/${slug || "index"}.md`;
  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setMenu(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); window.removeEventListener("keydown", onKey); };
  }, [menu]);
  async function copy() {
    setMenu(false);
    try {
      const markdown = await (await fetch(markdownPath)).text();
      await navigator.clipboard.writeText(markdown);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  }
  const pageUrl = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}`;
  return (
    <div ref={box} className="mn-copy-page">
      <button type="button" onClick={copy}>
        {copyIcon}
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy page"}
      </button>
      <button type="button" aria-label="More page options" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d={menu ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
      </button>
      {menu && (
        <div className="mn-copy-menu" role="menu" aria-label="Page options">
          <MenuItem icon={copyIcon} title="Copy page" hint="Copy page as Markdown for LLMs" onSelect={copy} />
          <MenuItem icon={markdownIcon} title={<>View as Markdown {external}</>} hint="View this page as plain text" href={markdownPath} onSelect={() => setMenu(false)} />
          {pageUrl && askAiLinks(pageUrl).map((link) => (
            <MenuItem key={link.name} icon={chatIcon} title={<>Open in {link.name} {external}</>} hint="Ask questions about this page" href={link.href} onSelect={() => setMenu(false)} />
          ))}
        </div>
      )}
      <span className="mn-sr-only" role="status">{state === "copied" ? "Page copied as Markdown." : ""}</span>
    </div>
  );
}
