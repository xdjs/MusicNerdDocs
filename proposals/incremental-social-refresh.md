Make routine social refreshes aware of previous completed account scans, so Music Nerd does not repeatedly pay to fetch the same recent history. Pete requested this on 2026-10-12 after the funded-account refresh. Parent: #1424. Research workers belong in MusicNerdAPI; shared schema belongs in MusicNerdWeb.

## Goal

Reuse a recent successful account check; otherwise send provider-supported date cutoffs from durable per-account scan checkpoints, with a 48-hour overlap for recent edits. Do not infer account coverage from an arbitrary saved post or targeted chat lookup. Keep explicit one-post research and historical backfills separate.

## Implementation

- Server-only checkpoint per artist/platform/normalized connected handle/scan scope (`latest` or `profile`); survives completed-job deletion. No public fields or extra scraping on profile reads.
- Fifteen-minute cooldown after a successful stored scan, including a valid empty result. Failed starts, failed collection, unrecognized results and changed accounts do not establish success.
- Preserve each paid run's original handle, cutoff and start time before starting it; retries resume its saved run/dataset. No new paid start after an ambiguous start response.
- Instagram date cutoff, X since filter and TikTok documented profile date filter. Preserve existing per-run limits and spending caps. The TikTok filter itself may carry a provider surcharge: do not claim savings before measurement.
- Only advance a coverage checkpoint for safely interpreted, fully stored, uncapped results. Limited results keep the previous boundary and record limited coverage internally; no silent gap skipping or unbounded catch-up.
- Initial collection remains bounded. No automatic corpus backfill or change to artist approval/publication.

## PRs

| PR | Item | State |
| --- | --- | --- |
| [Docs #13](https://github.com/xdjs/MusicNerdDocs/pull/13) | Refresh contract and limitations | Draft |
| [Web #1497](https://github.com/xdjs/MusicNerdWeb/pull/1497) | Durable private refresh checkpoint schema | Draft; migration not applied |
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

## Scope and rollout limits

Latest Instagram checks retain a 30-day floor and nine-result limit; the broad Instagram ingest retains its 200-result default, and TikTok/X retain 50. Latest and broad account scans use separate checkpoints. A targeted post or limited recent scan cannot suppress a broader initial ingest.

Previously, the presence of any saved social post could suppress a non-force profile ingest indefinitely. Now a queued ingest is eligible after the 15-minute checkpoint cooldown. This improves freshness but can increase spending compared with that old skip behavior. Public page reads do not queue scans.

Budget-limited completion must be treated conservatively. A provider can return SUCCEEDED and stop just below its maximum charge. The current draft therefore marks runs carrying a maximum-charge option as limited until an actor-specific completion signal is verified. These runs still benefit from cooldown but cannot advance their date boundary. Provider acceptance and cost measurements remain open before release; no claim of incremental savings for these runs.
