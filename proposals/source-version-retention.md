# Source version retention — October 6, 2026

Scope: the next foundation slice of [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424), before question-directed discovery and Web integration. Existing source/revision/UTF-16 references must reopen the same text after an eligible source changes.

## Contract

`GET /api/artist/{id}/knowledge/sources/{sourceId}` keeps its existing validated inputs, Privy claimant/admin authorization, window limits and no-store headers. The response adds `version: { state, currentRevision, capturedAt }`. For a current revision, state is `current` and capture time is null. For a retained revision, state is `historical`, passage metadata/text belong to the requested revision, and currentRevision names the currently eligible evidence. Capture time is retention time, not an event/publication timestamp. Unknown or pre-retention revisions retain `409 revision_changed`. Missing/deleted/ineligible sources return 404 after artist authorization; claim revocation returns 403. Storage errors return 503, never an empty success.

Search and listing continue to return only current eligible evidence. No new public access, agent write operation, provider call or source-search behavior is introduced. Generated summaries, answer/correction version history and topic-boundary capture are separate work. Consumers must not use historical text to override current corrections or imply it is the current account of an event.

## Persistence and access

Web owns a forward migration adding `artist_vault_source_versions` and `artist_social_post_versions`. Each retains the previous eligible source projection when citation-relevant content changes. Security-invoker database triggers capture writes from both applications in the writer's transaction: capture failure rolls back the source change. No detached work or retention side effect on a read. Store only the selected evidence/provenance fields used by the API, never the full provider payload. Approved vault bodies and own-post captions/supported transcripts are in scope. Retrieval timestamps and engagement-only updates do not produce versions.

Existing evidence is retained on its first subsequent change; no speculative backfill can recover content already overwritten. Source foreign keys cascade deletion to retained copies. The API rechecks current parent eligibility and artist ownership before reading any archive. Each snapshot retains its original artist ID, so reassigning a source cannot expose the previous artist's archive. Rejected/pending vault material and repost/foreign-owner social data are not eligible snapshots.

Enable RLS. Grant the existing server role `mnweb` only SELECT/INSERT on retained rows, with corresponding role-scoped policies; grant no UPDATE/DELETE and no anon/authenticated access. Individual user authorization remains in the API, as with existing server-owned tables. Revoke default PUBLIC execution on the capture helpers. Use security invoker with fixed search paths; no owner-privilege workaround. The migration must be applied before dependent API deployment.

The database fingerprint deduplicates selected stored projections; it is not the public citation revision. The API continues to derive the existing revision from normalized evidence and verifies the requested hash before returning text. A current source read loads one source only. Historical fallback reads at most 512 snapshots and 4 million serialized snapshot characters for that source, within one authorized read-only transaction. Overflow returns `413 revision_history_too_large`; it does not quietly skip older copies or return current text. Window and 128 KiB response limits still apply.

## Verification

- Existing citation → update → new citation → old citation opens identical text, metadata, hash and Unicode offsets; the new citation opens new text.
- Lore/PDF, own caption and supported IG transcript paths; metadata changes, retrieval-only updates, repeated content and transactions that roll back.
- Parent removal/rejection, claim revocation, wrong artist, reassigned source, newly foreign-owned/reposted social record, missing transcript and unknown revision cannot reveal retained evidence.
- Storage failure and version-history overflow are explicit; a fresh current read does not scan the archive or unrelated artist corpus.
- Actual `mnweb` capture/select succeeds and direct UPDATE/DELETE fails; public roles cannot read retained copies; source deletion purges them.
- Focused tests first, full repo gates, exact-commit API preview with authenticated reads and real disposable staging fixtures. Local PostgreSQL tests alone do not establish deployed behavior. No production mutation is part of preview verification.

Question routing, Discogs/MusicBrainz extensions, pending discoveries, early research progress and interview quality remain separate tracked slices. This prerequisite supplies durable originals for those consumers.
