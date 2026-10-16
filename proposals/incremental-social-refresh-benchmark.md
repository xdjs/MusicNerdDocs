# Live social refresh comparison — 2026-10-12 EDT

Nine direct Apify actor runs against LATASHA, using the funded Music Nerd account. No artist data was written and no application deployment or migration was performed. This tests provider behavior; it is not an end-to-end acceptance of API #38.

## Method

Compared the existing input (Instagram Latest: nine posts with the existing 30-day floor; TikTok/X: 50 posts) with two date filters: October 4 and October 10 UTC. Used identical actor builds per platform, same result limits and spending caps, and otherwise identical inputs. Per-run maximum charge: Instagram $0.03, TikTok $0.50, X $0.05. Total maximum $1.74; reported actual $0.2733.

The earlier successful production-run datasets supplied the already-saved ID reference. Concurrent fresh baseline runs supplied the bounded comparison set. Checked IDs, publication dates, missing in-window baseline IDs, run duration, and reported usage after completion. The October 10 case was intended to test little/no new material, but found two new TikTok posts and one new X post since the earlier reference.

## Observed results

| Platform / window | Returned | Already known | New vs earlier reference | Reported cost | Run seconds |
|---|---:|---:|---:|---:|---:|
| instagram / existing input | 9 | 9 | 0 | $0.0207 | 15.59 |
| instagram / since Oct 4 | 5 | 5 | 0 | $0.0115 | 20.84 |
| instagram / since Oct 10 | 3 | 3 | 0 | $0.0069 | 18.74 |
| tiktok / existing input | 50 | 48 | 2 | $0.1510 | 28.37 |
| tiktok / since Oct 4 | 13 | 11 | 2 | $0.0530 | 13.12 |
| tiktok / since Oct 10 | 2 | 0 | 2 | $0.0090 | 11.99 |
| x / existing input | 50 | 49 | 1 | $0.0200 | 7.41 |
| x / since Oct 4 | 2 | 1 | 1 | $0.0008 | 6.56 |
| x / since Oct 10 | 1 | 0 | 1 | $0.0004 | 5.51 |

All six filtered runs included every in-window post in their corresponding fresh bounded baseline. This is not proof of complete account history or general recall. Instagram returned three old pinned posts outside both cutoffs, including July material; the date filter is not a strict boundary for pinned results.

The October 10 runs found all three new posts present in the baselines. Compared with the existing inputs: 109 returned items became six, including three duplicate Instagram pinned posts; combined reported cost fell from $0.1917 to $0.0163 (91.5%). TikTok/X were faster; Instagram was slower (18.74s versus 15.59s). One artist and one run per variant do not establish typical savings or latency.

TikTok date filtering carries extra cost per result: the 13-item run cost $0.053 versus the unfiltered 50-item run at $0.151. It still saved money here because far fewer items were returned. Documentation: https://apify.com/clockworks/tiktok-scraper/input-schema

## Decision and remaining implementation

Provider filtering passes this bounded pilot. API #38 does NOT yet pass end-to-end incremental acceptance: its conservative maximum-charge classification marks all nine runs limited, so an automatic checkpoint would not advance. No claim that the draft achieves these savings in production.

Revise the checkpoint design to distinguish recent-feed continuity from complete historical ingestion. A bounded first feed scan can establish an ordered recent reference without claiming historical completeness. Subsequent scans must reconnect to previously stored account-scan overlap/anchors before advancing; arbitrary targeted-post rows are not anchors. If the cap is hit before reconnecting, retain the gap and schedule separately bounded catch-up rather than skip it. Preserve cooldown, immutable paid-run inputs, identity/revocation guards and spending caps. Validate provider ordering/pinned handling before accepting this algorithm.

Keep older Instagram pinned posts out of the new-material count and downstream processing when unchanged; this cannot undo charges already incurred by the actor. Consider alternate actor inputs only if separately measured.

Before ready-to-merge: implement and replay anchor/gap handling against captured runs plus capped/missing/empty fixtures; paired staging worker verification after migration; second-artist and busy-account acceptance; true empty TikTok/X cases; no-new-post cooldown acceptance through the actual worker. These remain open.

## Run evidence

- instagram baseline: run `wzAslulbaTJRWCtpJ`, build `5yGvyXVrmmJGK7Kzf`.
- instagram window: run `olSwUzPN7utO8WjiR`, build `5yGvyXVrmmJGK7Kzf`.
- instagram empty: run `OGadVxyxNVE4iLMA3`, build `5yGvyXVrmmJGK7Kzf`.
- tiktok baseline: run `HXcqYIdfVm3gsZHuX`, build `LODXsZPXqHeTq0Ssg`.
- tiktok window: run `VALS2eA7LaO0R6DtC`, build `LODXsZPXqHeTq0Ssg`.
- tiktok empty: run `Bw6m8v7k9ImUgXbNr`, build `LODXsZPXqHeTq0Ssg`.
- x baseline: run `iUF8gq2xW0IV5TT8i`, build `QPJVw9mpWzWbDzazl`.
- x window: run `zhIYByoo0JWehW5g0`, build `QPJVw9mpWzWbDzazl`.
- x empty: run `WeEAbV9KJHzTwpVT6`, build `QPJVw9mpWzWbDzazl`.

## Revised-cutoff pilot — same evening

Three more live requests used the cutoffs generated from the newest three non-pinned IDs in each captured fresh baseline, minus48hours. Replay tests assert these exact cutoffs match the production planner. Same limits/caps as before; no artist data writes.

| Platform | Generated cutoff (UTC) | Results | Charge | Seconds |
|---|---|---:|---:|---:|
| Instagram | Sep30 19:21:48 |8|$0.0184|15.926|
| TikTok | Oct7 23:38:45 (sent as Oct7)|9|$0.0370|8.649|
| X | Sep22 08:32:30 (sent as Sep22)|3|$0.0012|20.246|

All three returned every saved reference and every in-window ID from the corresponding bounded baseline.20 returned items versus109; $0.0566 versus$0.1917 (70.5%lower). These are the revised algorithm's observed savings, not the earlier91.5%hand-picked-window comparison. Additional pilot cost$0.0566; cumulative twelve-run charge$0.3299. X was slower here, so no general speedup claim.

Instagram additionally returned a Sep30 post absent from both earlier nine-item sets. This is older material newly observed, not a newly published post, and shows why the bounded baseline cannot prove exhaustive recall. TikTok/X retained the same three newly published posts seen earlier.

Run IDs: Instagram`3ba0JCd1CgYslHGte`, TikTok`GRaNtpgvQmDA7cpnr`, X`ol7wB7hBlKKIN03WL`. Public-ID/date-only fixtures in API #38 replay the actual planner and continuity assessment. Separate tests remove a saved reference and verify no advancement; PGlite verifies persisted gaps, reconnection and cooldown. The real Instagram Latest collector is exercised with captured ID/date/pinned metadata, including an aged reference beyond30days and old pinned results excluded from Latest storage. Auth, job fencing and provider fetches are mocked in that collector test; it is not a deployed worker test.

Reference logic has now been revised in API #38; the older rejection above describes the pre-revision draft. Staging migration/paired-worker verification, second-artist and busy-account acceptance, and recovery for deleted references remain open before release.


## Second artist: Dutchyyy (2026-10-16)

Four bounded live runs used the integrated API #38 provider starters and the actual reference planner: one baseline and one reference-window run each for Instagram `peacepeacegawd` and X `dutchmassive`. No application artist data was written by these provider comparisons. Instagram retained a nine-result / $0.03 cap; X retained 50 results / $0.05. Start intent was saved before each request, with no automatic restart.

| Platform | Baseline items | Reference-window items | Baseline charge | Window charge | Generated cutoff |
| --- | ---: | ---: | ---: | ---: | --- |
| Instagram | 9 | 5 | $0.0207 | $0.0115 | 2026-09-30T12:00:06.000Z |
| X | 50 | 10 | $0.0200 | $0.0040 | 2026-10-14T02:24:54.000Z (provider day precision) |

Combined observed charges were $0.0407 versus $0.0155, about 61.9% lower for this pair. Every saved reference and every non-pinned baseline ID inside the requested window reappeared. The actual continuity assessor accepted both windows; removing one reference from each captured result retained a gap. X reached the 50-item baseline limit, so that baseline does not establish complete history. The independent comparison set is itself bounded and cannot detect omissions shared by both requests.

The three Instagram references were `4007823171111352282`, `4002622022623964293`, `3999033866871915560`; X references were `2110961955259519184`, `2110923768793268637`, `2110919885950005295`. These are public post identifiers, not provider run credentials.

This is a second artist and a capped baseline, not a universal savings claim. TikTok was not rerun for this artist; its charged-filter and empty-result observations remain historical. A genuinely busy interval that pushes every anchor beyond a result cap is covered by controlled truncation tests, not claimed as a new live observation.

### Separate staging evidence

Migration 0052 was applied to staging. The actual checkpoint planner/writer passed real `mnweb` CRUD/RLS checks, browser-role SELECT denial, one recovery reservation, subsequent review, successful reconnection, cooldown and revoked-job denial; those verification rows were rolled back. A separate real concurrent-transaction check granted exactly one recovery reservation and blocked the other for review, with zero provider starts; its disposable records were removed.

Web `783cc068` and API `0570ab3` passed local and hosted checks. Authenticated paired-preview acceptance passed on staging Dutchyyy: Update Latest completed one capped Instagram run ($0.0184 under the $0.03 cap), stored eight posts and three reference IDs, and retained a limited initial-coverage status. Reload restored the existing 30-minute UI cooldown with no new job or run ID. Separately, the actual Instagram worker against this live checkpoint returned checked/skip with zero paid starts; provider-start was instrumented to fail if invoked. This separates browser repeat prevention from the worker-level 15-minute checkpoint cooldown. Spotify reported a separate source failure; Instagram, In Process, Deezer and published answers were checked. LATASHÁ correctly refused a competing Instagram scrape because an older social-ingest job was pending. These are draft changes; no production migration or release is claimed.
