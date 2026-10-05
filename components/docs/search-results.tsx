"use client";
import Link from "next/link";
import { docHref, type NavPage } from "@/lib/docs";
import { MethodPill } from "./method-pill";

/** The matches for a search query, shared by the header search and the phone search dialog. */
export function SearchResults({ results, query, onNavigate }: { results: NavPage[]; query: string; onNavigate: () => void }) {
  if (!query.trim()) return null;
  return (
    <div className="mn-search-results">
      <p role="status">{results.length ? `${results.length}${results.length === 30 ? "+" : ""} results` : "No matches. Try an endpoint or a task."}</p>
      {results.map((page) => (
        <Link key={page.slug} href={docHref(page.slug)} onClick={onNavigate}>
          {page.api && <MethodPill method={page.api.method} />}
          <span>
            <strong>{page.slug ? page.title : "Introduction"}</strong>
            <small>{page.group}{page.api ? ` · ${page.api.path}` : ""}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}
