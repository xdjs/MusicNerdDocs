"use client";
import { useEffect, useRef, useState } from "react";
import type { NavPage } from "@/lib/docs";
import { searchDocs } from "@/lib/docs/ui/searchDocs";
import { SearchResults } from "./search-results";

/** The header's search box (desktop): ⌘K focuses it, results open below it, Escape or a click away closes them. */
export function HeaderSearch({ pages }: { pages: NavPage[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape" && box.current?.contains(document.activeElement)) {
        setQuery("");
        setOpen(false);
        input.current?.blur();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);
  function navigate() {
    setQuery("");
    setOpen(false);
  }
  return (
    <div ref={box} className="mn-header-search">
      <label className="mn-search-field">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input ref={input} type="search" value={query} placeholder="Search…" aria-label="Search the docs" onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} />
        <kbd>⌘K</kbd>
      </label>
      {open && query.trim() && (
        <div className="mn-search-popover">
          <SearchResults results={searchDocs(pages, query)} query={query} onNavigate={navigate} />
        </div>
      )}
    </div>
  );
}
