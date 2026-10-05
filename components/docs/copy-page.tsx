"use client";
import { useEffect, useRef, useState } from "react";

/** Copies the page as Markdown (its /raw copy), with a menu to open that Markdown. */
export function CopyPage({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const href = `/raw/${slug || "index"}.md`;
  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => { if (!box.current?.contains(event.target as Node)) setMenu(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); window.removeEventListener("keydown", onKey); };
  }, [menu]);
  async function copy() {
    try {
      const markdown = await (await fetch(href)).text();
      await navigator.clipboard.writeText(markdown);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  }
  return (
    <div ref={box} className="mn-copy-page">
      <button type="button" onClick={copy}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy page"}
      </button>
      <button type="button" aria-label="More page options" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {menu && (
        <div className="mn-copy-menu">
          <a href={href} onClick={() => setMenu(false)}>View as Markdown</a>
        </div>
      )}
      <span className="mn-sr-only" role="status">{state === "copied" ? "Page copied as Markdown." : ""}</span>
    </div>
  );
}
