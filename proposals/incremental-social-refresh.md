Make routine social refreshes aware of previous completed account scans, so Music Nerd does not repeatedly pay to fetch the same recent history. Pete requested this on 2026-10-12 after the funded-account refresh. Parent: #1424. Research workers belong in MusicNerdAPI; shared schema belongs in MusicNerdWeb.

## Goal

Reuse a recent successful account check; otherwise send provider-supported date cutoffs from durable per-account scan references, with a 48-hour overlap for recent edits. Do not infer account coverage from an arbitrary saved post or targeted chat lookup. Keep explicit one-post research and historical backfills separate.

## Implementation

- Server-only checkpoint per artist/platform/normalized connected handle/scan scope (`latest` or `profile`); survives completed-job deletion. No public fields or extra scraping on profile reads.
- Fifteen-minute cooldown after a successful stored scan, including a valid empty result. Failed starts, failed collection, unrecognized results and changed accounts do not establish success.
- Preserve each paid run's original handle, cutoff and start time before starting it; retries resume its saved run/dataset. No new paid start after an ambiguous start response.
- Instagram date cutoff, X since filter and TikTok documented profile date filter. Preserve existing per-run limits and spending caps. The TikTok filter itself may carry a provider surcharge: do not claim savings before measurement.
- Store up to three recent, non-pinned IDs from an account scan. Advance recent-feed continuity only when a later safely interpreted, stored scan reaches every saved reference. A cap may be reached after the references without invalidating that reconnection. Missing references preserve the old boundary and a durable gap; no automatic unbounded catch-up.
- Initial collection remains bounded. No automatic corpus backfill or change to artist approval/publication.

## PRs

| PR | Item | State |
| --- | --- | --- |
| [Docs #13](https://github.com/xdjs/MusicNerdDocs/pull/13) | Refresh contract and limitations | Draft |
| [Web #1497](https://github.com/xdjs/MusicNerdWeb/pull/1497) | Durable private refresh checkpoint schema | Draft; migration not applied |
| [API #38](https://github.com/xdjs/MusicNerdAPI/pull/38) | Reference-based cutoffs, cooldown and retry fences | Draft |

## Done when

- A repeated recent refresh makes zero new provider starts; after cooldown it includes the oldest saved reference plus 48-hour overlap.
- Changed handles, arbitrary targeted new posts, capped output, bad payloads, provider failure, partial collection and concurrent retries cannot incorrectly advance coverage.
- Exact-post chat research remains available and cannot advance account coverage.
- Local tests, app-role migration verification and paired preview behavior are recorded separately from actual provider behavior/cost.
- New code remains draft until verification; production promotion is separate.

## Provider input contract

Instagram uses `onlyPostsNewerThan`; TikTok uses `oldestPostDateUnified` with latest sorting and pinned posts excluded; X uses a `since:YYYY-MM-DD` restriction. X/TikTok day precision rounds the lower bound down. These inputs constrain returned results; they do not promise the provider performs zero repeated underlying requests or charges nothing for an empty run. TikTok documents its date filter as charged.

Provider references checked 2026-10-12:
- https://apify.com/apify/instagram-scraper/input-schema
- https://apify.com/clockworks/tiktok-scraper/input-schema
- https://apify.com/apidojo/tweet-scraper/input-schema

A capped first scan is not a complete historical baseline. Keep the last proven boundary on a limited result; a busy account may remain limited until a separate bounded catch-up is implemented. No automatic historical catch-up is added here. Existing exact-post chat input and cost limits are unchanged.

Checkpoints are internal persistence, not a new endpoint. Public profile reads remain read-only. Schema must precede API deployment; this document is a proposed implementation contract until the linked PRs are released.

## Scope and rollout limits

Latest Instagram checks retain a 30-day floor and nine-result limit; the broad Instagram ingest retains its 200-result default, and TikTok/X retain 50. Latest and broad account scans use separate checkpoints. A targeted post or limited recent scan cannot suppress a broader initial ingest.

Previously, the presence of any saved social post could suppress a non-force profile ingest indefinitely. Now a queued ingest is eligible after the 15-minute checkpoint cooldown. This improves freshness but can increase spending compared with that old skip behavior. Public page reads do not queue scans.

## Revised reference contract (2026-10-12)

The first bounded scan seeds at most three newest non-pinned post IDs and publication dates. It does not claim complete history. Later queries begin 48 hours before the oldest saved reference (rounded down to a day for TikTok/X). This may extend beyond the initial Latest 30-day query floor for a quiet account; result and spending limits stay fixed. Latest still only stores recent posts, while an older previously stored reference returned by the provider may establish continuity without republishing it as new material.

The worker persists this reference with the immutable run intent. After all intended rows are stored, it checks that every reference ID reappeared. Only then may `covered_through` advance and the reference rotate. `complete` here means observed recent-feed continuity, not exhaustive historical or provider coverage. Pinned posts never establish anchors. A deleted/newly pinned reference, truncated scan, malformed result or missing reference retains the old reference and `gapSince`. No automatic catch-up worker is introduced in this draft; unresolved gaps stay explicit in server storage.

Successful empty results still receive the cooldown but cannot invent a reference or erase a gap. Unknown/malformed persisted reference payloads fail closed. Claim revocation removes reference state with the posts. Standalone targeted-post research cannot seed references. The existing thumbnail retention is reused; caption upserts retain new wording. Existing caption-credit extraction is separate and not upgraded to revision-based invalidation by this PR.

Apify success and spending metadata alone do not prove coverage. Reconnection is bounded empirical evidence only: a provider could still omit a post while returning the anchors. Captured replay tests and independent comparison sets remain necessary. Deletion/new pinning needs explicit reference recovery; silently dropping a missing anchor is not safe.

See [live comparison and revised-cutoff acceptance](incremental-social-refresh-benchmark.md). Provider pilot and local SQL/collector tests do not replace staging worker and authenticated preview verification. Schema must precede API release; all PRs remain drafts.
