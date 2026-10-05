# Recover missing original source text

October 5, 2026. Pete requested continuing phase 2 and verifying production Lore URL text for DUTCHYY/LATASHA. Refs [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424). API owns extraction; Web owns the existing job table schema. This slice fills missing approved URL bodies. It does not overwrite existing originals, fetch private uploads, generate text, auto-approve sources or change interview behavior.

## Contract

`POST /api/artist/{id}/knowledge/sources/extract` requires an approved claimant or admin's Privy token. Strict JSON body: `sourceIds`, one to twenty distinct vault record UUIDs. The host chooses sources; no autonomous model write tool is added. Requests select only this artist's approved public HTTP(S) URL records without stored text or a private file. Invalid selection is explicit; a concurrent extraction returns 409. Return 202 with the durable job ID and selected source count, or 200/no job if all selected eligible records already have text. Reauthorize under the artist lock before enqueueing.

A new `source_extract` job kind uses the existing durable research scheduler. Its schema prerequisite adds the kind to the check constraint; it does not widen grants/RLS. Each worker slice processes a source, checkpoints outcome and cursor atomically with any text write, and releases its lease. Fetches happen outside transactions. Before writing, recheck current ownership/job presence and source URL, approval and missing-text state. Changed or removed sources are skipped. Database failures throw for the existing job retry policy; failed/blocked web reads are recorded and can be deliberately retried later.

Bound HTTP HTML reads by timeout, response bytes and redirects; reject private/reserved destinations, credential-bearing URLs and unsupported content. Resolve and pin public DNS addresses for each redirect hop. Parse HTML without executing scripts. Prefer an article/main region when available and remove non-content elements. Preserve original wording and paragraph structure; metadata is never substituted for body text. Store at most 50,000 characters with explicit truncation in the result. A successful HTTP status is not proof of useful or complete article content.

`getResearchStatus` exposes sanitized extraction outcomes: source ID, result category, captured time, HTTP status, stored character count and truncation. Never return job state wholesale, credentials, raw payloads or private source URLs. Knowledge reads remain side-effect free. A completed job means its sources were attempted, not that every source is readable or factually supports a question.

This HTTP-only slice records browser-required/blocked sources rather than treating a search snippet as original evidence. Manual browser recovery for the requested production audit is kept distinguishable from automated ingestion. Durable browser-provider integration, immutable historical source retention and active topic boundaries remain separate unfinished phase-2 work.

## Automatic ingestion follow-up (October 5)

Web add/approval transactions will queue one missing approved URL per durable job, including
trusted contributor additions and admin bulk approval. Pending sources, uploads and existing
originals are excluded. Per-source live uniqueness prevents duplicates without dropping new
sources when another job is running. Queue failures roll back the source mutation.

Internal version-2 job state records the source and approved claim generation and inherits
the addition/approval activity. This is narrowly authorized ingestion of an approved public
source, not impersonation of its contributor. The API worker rechecks the claim, lease,
approval, URL and missing-text state before fetching and writing. Version-1 explicit API
jobs keep their claimant/admin checks. No public request can choose version-2 state.
Blocked/unsupported results finish visibly; reads never schedule or scrape.

Web migration 0037 follows 0036 and retains the existing live-job index and conflict-query
compatibility. Automatic jobs wait in an internal `queued` backlog, with per-source
uniqueness; the API claims one per artist at a time and reports waiting jobs as `pending`
through the public tools. Old workers ignore queued work. Apply 0037 before either new
API or Web writes, and release the compatible API worker before Web automatic queueing. This follow-up does not change the public endpoint, retention
policy, question prompts or promise immediate Lore-summary regeneration.

## Done when

- Every current production approved URL for both named artists has a recorded text/readability/identity result; PDF originals remain included. No unrelated namesake silently becomes evaluation evidence.
- Missing approved URL text can be queued through authenticated HTTP and processed through the existing worker without overwriting text or writing after approval/ownership changes.
- Outcomes survive a worker restart, safe retries do not duplicate writes, and no read triggers collection. Original passages reopen with stable current references.
- New validation/authorization/checkpoint/HTTP extraction failures are covered red before green. Local and exact-preview checks distinguish mocked, real database, authenticated HTTP and manual source recovery evidence.
