"use client";
import { useRef, useState } from "react";
import type { NavPage } from "@/lib/docs";
import { searchDocs } from "@/lib/docs/ui/searchDocs";
import { closeOnBackdrop } from "./close-on-backdrop";
import { SearchResults } from "./search-results";

/** The phone header's search: an icon that opens a search sheet. Escape or a tap outside closes it. */
export function SearchDialog({ pages }: { pages: NavPage[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  function close() {
    setQuery("");
    dialog.current?.close();
  }
  return (
    <>
      <button type="button" className="mn-icon-button mn-phone-only" aria-label="Search" onClick={() => dialog.current?.showModal()}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </button>
      <dialog ref={dialog} className="mn-search-sheet" aria-label="Search the docs" onClick={(event) => closeOnBackdrop(event, close)} onClose={() => setQuery("")}>
        <div className="mn-sheet-body">
          <label className="mn-search-field">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" value={query} placeholder="Search…" aria-label="Search the docs" onChange={(event) => setQuery(event.target.value)} autoFocus />
          </label>
          <SearchResults results={searchDocs(pages, query)} query={query} onNavigate={close} />
        </div>
      </dialog>
    </>
  );
}
