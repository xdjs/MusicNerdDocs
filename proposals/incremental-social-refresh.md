Make routine social refreshes aware of previous completed account scans, so Music Nerd does not repeatedly pay to fetch the same recent history. Pete requested this on 2026-10-12 after the funded-account refresh. Parent: #1424. Research workers belong in MusicNerdAPI; shared schema belongs in MusicNerdWeb.

## Goal

Reuse a recent successful account check; otherwise send provider-supported date cutoffs from durable per-account scan checkpoints, with a 48-hour overlap for recent edits. Do not infer account coverage from an arbitrary saved post or targeted chat lookup. Keep explicit one-post research and historical backfills separate.

## Implementation

- Server-only checkpoint per artist/platform/normalized connected handle; survives completed-job deletion. No public fields or extra scraping on profile reads.
- Fifteen-minute cooldown after a successful stored scan, including a valid empty result. Failed starts, failed collection, unrecognized results and changed accounts do not establish success.
- Preserve each paid run's original handle, cutoff and start time before starting it; retries resume its saved run/dataset. No new paid start after an ambiguous start response.
- Instagram date cutoff, X since filter and TikTok documented profile date filter. Preserve existing per-run limits and spending caps. The TikTok filter itself may carry a provider surcharge: do not claim savings before measurement.
- Only advance a coverage checkpoint for safely interpreted, fully stored, uncapped results. Limited results keep the previous boundary and report limited coverage; no silent gap skipping or unbounded catch-up.
- Initial collection remains bounded. No automatic corpus backfill or change to artist approval/publication.

## PRs

| PR | Item | State |
| --- | --- | --- |
| Docs TBD | Refresh contract and limitations | In progress |
| Web TBD | Durable private refresh checkpoint schema | In progress |
| API TBD | Incremental provider inputs, cooldown and retry fences | In progress |

## Done when

- A repeated recent refresh makes zero new provider starts; after cooldown it uses the saved boundary plus overlap.
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
