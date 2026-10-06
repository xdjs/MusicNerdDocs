# Shared artist knowledge tools — proposed v1 contract

Status: pre-implementation proposal for [MusicNerdWeb#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424), October 5, 2026. The subsequent [implementation guide](../content/source/artist-knowledge.mdx) and [OpenAPI reference](../content/source/api-reference/openapi/knowledge.json) are the current read-interface contract. Runtime and release status are tracked in #1424. The adjacent proposal OpenAPI preserves the original design; it is not the current endpoint schema.

Docs#2 now includes [Docs#1](https://github.com/xdjs/MusicNerdDocs/pull/1) as an explicit engine dependency so the reference pages, navigation and generated content can be previewed. Docs#1 itself is unchanged. Social ingestion shipped through [MusicNerdAPI#18](https://github.com/xdjs/MusicNerdAPI/pull/18); the Web interviewer integration remains a separate phase.

The [baseline requirements assessment](agent-requirements-assessment.md) records Pete’s source-verification, durable-boundary and held-out evaluation additions. The current read contract explicitly exposes the remaining boundary-storage, historical-version and extraction gaps instead of claiming them complete.

## Outcome and boundaries

MusicNerdAPI owns stored artist evidence and retrieval. An agent can orient itself, locate an unfamiliar connection, reopen the exact original passage, check corrections and earlier answers, and distinguish a supported premise from a hypothesis. MusicNerdWeb's interviewer will use this API in a subsequent PR. Other authorized agents use the same HTTP operations; an AI SDK wrapper gives them validated tool inputs and bounded outputs, not a second research implementation.

No question drafting, interviewer tone, prompt/model changes or automatic model-generated biography is introduced here. Reads do not scrape, generate, mutate, or wait for research. Stored text is the evidence; generated Lore is an explicitly labelled navigation aid.

## Seven tools

Five evidence reads and two research controls. Artist identity and caller credentials are fixed by the application when it constructs the tool set; a model never supplies an account ID, bearer token or arbitrary remote URL. A general client can choose an artist in its application layer and create a new scoped tool set.

| Tool | HTTP operation | Use and principal result |
| --- | --- | --- |
| `getArtistBrief` | `GET /api/artist/{id}/knowledge/brief` | Stored profile, bounded existing Lore summary labelled generated, inventory counts, readiness/coverage and a pointer to mandatory history. No new synthesis. |
| `listArtistSources` | `GET /api/artist/{id}/knowledge/sources` | Paginated metadata for eligible vault sources and the artist's own stored social captions/reel transcripts; identify what can actually be read. |
| `searchArtistKnowledge` | `GET /api/artist/{id}/knowledge/search` | Ranked original passages across the accessible corpus with stable references and coverage. Search is a lead, not proof that nothing else exists. |
| `readArtistSource` | `GET /api/artist/{id}/knowledge/sources/{sourceId}` | Open a bounded original-text window at a specific revision/offset; continue through long PDFs without replacing them with a summary. |
| `getInterviewHistory` | `GET /api/artist/{id}/knowledge/history` | Exact saved questions, answers, skips, pending offers and corrections, with sitting/offer chronology and pagination. |
| `requestArtistResearch` | `POST /api/artist/{id}/research/refresh` | **Existing endpoint.** Explicit authorized request to rebuild Lore and check posts under existing cooldown/ownership rules. Returns the existing message; does not promise source-link refetch or completed work. |
| `getResearchStatus` | `GET /api/artist/{id}/research/status` | Sanitized existing job statuses, progress and known readiness. A completed job is not proof of complete evidence coverage. |

Do not give an interview question generator the research mutation tool by default. A caller that has already authorized research can enable it; the tool's execution must still pass ordinary API authorization and existing cooldown/ownership checks. Client abort/deadline/step limits apply even if a model keeps requesting tools. The API does not expose the scheduler secret or provider credentials.

## Access contract

The initial evidence surface includes uploaded vault documents, unpublished offers/answers and corrections. Approval of a vault source means it is eligible for research; it is **not** a public-release flag. These seven operations therefore use the existing Privy bearer authentication and approved-claimant-or-admin artist authorization. Third-party agents operate on behalf of an authorized user. This first version does not introduce an API-key system, anonymous raw-vault access or unrestricted access to every artist.

Use `Authorization: Bearer <Privy access token>` over HTTPS. Derive the Music Nerd user from the verified token and reauthorize the artist on **every** operation, including pagination, source expansion and status reads. A source must belong to that artist and remain eligible; knowing a source ID or content hash is not authorization. Do not cache authenticated responses publicly (`Cache-Control: private, no-store`). Approved claimant changes must invalidate any application-side cached authority.

There is currently no durable per-session membership model in `artist_interview_answers`: records are artist-scoped. Do not claim finer session isolation than the schema provides. Unsaved conversation turns are supplied by the trusted interviewer controller and are not stored or exposed by these read tools. A future public-knowledge tier must explicitly select publishable fields; it must not relax this vault/history authorization by accident.

## Evidence and citation identity

Source IDs name records, not their rank in a prompt: `vault:<uuid>`, `social:<uuid>:caption`, or `social:<uuid>:transcript`. Interview/correction IDs are namespaced separately in history. Filtering or reranking never changes identity. Never zip a ranked manifest to a differently ordered source list; the existing Lore builder's numeric labels are not a safe identifier for this API.

Each readable source returns:

- `sourceId`, `kind`, `title` and `url` (nullable for an upload without an original public URL).
- `revision`: a SHA-256 hash of the canonical evidence text plus its citation-relevant identity, URL, publication date and provenance. The API defines and tests the canonical encoding. Retrieval timestamps are excluded, so rereading unchanged evidence does not change the revision.
- `publishedAt` and `ingestedAt`, separately nullable. Never substitute row creation time for publication or claim a legacy retrieval timestamp is known.
- `readiness` and `coverage`, including stored text length, known truncation and extraction limitations. Text presence is not proof that every PDF page or image was extracted.
- `provenance`: vault upload/link, social caption, or provider transcript. Reel transcripts preserve provider/method and speaker uncertainty; a connected account does not establish who speaks in its audio.

Passages include `sourceId`, `revision`, exact `text`, and zero-based half-open `start`/`end` **UTF-16 code-unit** offsets into that revision's original stored text. Adjust window boundaries around surrogate pairs; report the resulting actual offsets. PDF page numbers and audio timestamps are nullable and populated only when extraction supplied a trustworthy map. Do not manufacture page numbers from character offsets.

`readArtistSource` requires the revision obtained from listing or search. Changed content returns `409 revision_changed`, never different text under the old reference. The released baseline detects revisions without historical replay. The [retention preview](source-version-retention.md) adds exact older reads with current access checks; an unretained revision still returns 409. Deleted or newly ineligible evidence returns `404` after artist authorization. Existing references do not grant permanent access to removed evidence.

A citation is a structured object, not a shortened substitute for evidence. Human-facing questions may show compact labels, but the application retains the full source ID, revision, original URL and offsets. A source can support the question's premise without proving the connection suggested by the question; callers must preserve that distinction.

## Bounded reads and meaningful omissions

All proposed limits below are initial engineering limits, **not measured latency or quality results**. Inputs outside the limits return `400`; output is never silently sliced.

| Operation | Default / maximum |
| --- | --- |
| Brief | 6,000 text characters across stored profile and generated summary; count inventory separately |
| Source list | 20 / 50 metadata records; title capped at 300 characters with an explicit truncation flag |
| Search | Query 1–500 characters; 5 / 10 passages; 6,000 / 12,000 total evidence characters |
| Source read | 6,000 / 20,000 characters from `start`; return `nextStart` until the revision is exhausted |
| History | 20 / 50 entries; 12,000 / 20,000 text characters; entry continuation for a long exact answer/correction |
| Research status | 20 / 50 sanitized jobs per page |

The response contains `returnedChars`, `truncated`, `nextCursor` or `nextStart`, and coverage where applicable. Pagination cursors are opaque, versioned, bound to artist/filter/ordering and validated. A cursor is not a credential. If the ordered corpus changes between pages, return `409 corpus_changed` and require restarting; do not silently skip a changed record. Authorization/eligibility changes take precedence over serving an old cursor.

Use stable ordering with an ID tie-breaker. Bound serialized responses to 128 KiB in addition to evidence-character limits; if metadata uses the remaining budget, emit a continuation before another item. Never split a citation away from its passage. A single long history entry returns an explicit text slice, entry revision and continuation; no silent summary of the artist's words. Clients must not treat a partial answer as complete.

No matches is `200` with an empty result list and explicit coverage. A database failure is `503 storage_unavailable`, not an empty successful corpus. Empty extraction is reported as unreadable/unknown according to available evidence; do not invent a failed job for a legacy empty row. Missing sources, unreadable PDFs, unknown dates, provider transcript uncertainty and legacy extraction limits remain visible.

## Memory and retrieval behavior

The API separates three layers:

1. **Stored evidence:** approved vault text/files and own social posts, including selective transcript context. Read the whole stored original when needed; large PDFs have no first-4,000-character restriction.
2. **Stable orientation:** the stored profile, explicitly generated Lore summary and source inventory. These help choose what to read; unsupported summary prose cannot become a new citation.
3. **Interview memory:** exact saved answers, corrections, skips and offer chronology. The active answer and current topic boundaries are supplied every turn by the interviewer controller, not left to optional similarity search.

Before generating questions, the client deterministically loads the brief and the relevant current history/constraints, then lets the agent search and expand evidence. Current corrections must be loaded completely (following pagination/continuations) or the controller must mark preparation incomplete. Older answers remain retrievable. A skip is evidence that a question was dealt with, not an automatic permanent topic ban. Explicit topic boundaries in the current session remain binding even when no database field stores them yet.

`getInterviewHistory` preserves `questionKey`, verbatim `question`, exact `answer` or explicit null, `source`, `sitting`, `offeredAt` and answer-update time. Pending offers are not conflated with explicit skips: the implementation must use the same stored status/source conventions as Web. `created_at` can change on answer upsert; it must not reconstruct offer time or sitting. Null legacy times stay unknown (or use a documented legacy sitting rule), never guessed. Corrections return their original claim, kind and exact correction, not a model paraphrase.

Search must cover all eligible stored text or declare precisely what it did not scan. Ranking may use lexical, semantic or hybrid methods, but the HTTP contract does not promise that embeddings alone solve recall. Evaluate lexical and hybrid candidates against full-original controls before choosing the index. Return surrounding qualifications, deduplicate overlapping hits, and retain source diversity. A narrow date filter is opt-in: older context may explain a new post.

Do not rebuild a knowledge index in MusicNerdWeb. The API service functions are the single implementation for HTTP handlers and tools used inside API-hosted agents. A Web/external-agent wrapper calls the HTTP API and validates the same response schema. Credential lookup and artist scope remain outside model-controlled arguments. An AI SDK tool provides a narrow description, `inputSchema`, and `execute`; the host sets a bounded tool loop and output budget using the installed SDK's current APIs. See [AI SDK tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling). MCP can wrap these operations later; it is not required for this phase.

## Ingestion and readiness

Ordinary reads use stored originals and do not fetch the source URL. Ingest/extract when a source is added and deliberately refresh when requested. Existing manual link enrichment can terminate with its request; this needs a durable job handoff before promising reliable new-source readiness. Existing stored website text may have been capped at 50,000 characters, and existing PDF text does not guarantee OCR or page-level coverage.

New ingestion should record queued/running/ready/failed state, a safe error category, extraction version, timestamps and known limits. Legacy records report unknown coverage where those facts do not exist. Do not infer complete extraction just because `extracted_text` is nonempty. Original uploads remain in controlled storage; the response never exposes storage credentials or expiring internal signed URLs as permanent citations.

The existing `research/refresh` rebuilds Lore and checks social posts; it does **not** durably refetch every manually added website. The proposed tool wraps that behavior accurately. Durable link ingestion/refresh and immutable historical source retention require an explicit implementation/migration decision, owned by #1424; they must not disappear behind a successful research-status response. A first read-only API slice can retrieve current stored evidence with visible legacy gaps while that work proceeds.

## Errors and compatibility

New reads return flat `{ "status": "ok", ... }` results or `{ "status": "error", "error": "...", "code": "..." }`; never a `data` wrapper. Use 400 invalid input, 401 missing/invalid authentication, 403 unauthorized artist, 404 unavailable source, 409 revision/corpus change, 429 throttled, and 503 storage unavailable. Error details must omit SQL, private source text, provider payloads and credentials. Respect `Retry-After` where supplied; do not retry authorization or revision failures blindly.

The existing refresh route keeps its current `{ status, message }` success and `{ status, error }` failure responses; adding these tools must not require current Web callers to migrate immediately. Its message can describe cooldown/ongoing work. Call status separately to observe the actual jobs. The status API must use a strict query path: the existing helper that catches database exceptions and returns `[]` is unsuitable for an agent contract.

## Implementation sequence and acceptance

1. **Docs contract:** review these boundaries and the adjacent OpenAPI. Integrate reference pages with the docs engine before the implementation PR.
2. **Shared API reads:** validated inputs/auth; strict database reads; stable source/revision/offset references; bounded listing/search/expansion/history/status; reusable tool definitions. Keep the existing refresh operation compatible.
3. **Required ingestion reliability:** document actual legacy coverage, add a durable handoff for new lore links and decide source-version persistence. Schema changes live with the schema-owning Web migrations and are independently app-role verified.
4. **Real consumers and retrieval evaluation:** HTTP client plus AI SDK agent client use the same API on an exact-commit preview. The Web interviewer UI follows in its own PR.

Acceptance evidence must include:

- Authorized owner/admin success; anonymous, other-user, cross-artist-source and revoked-claim rejection. No shared-cache leakage; source approval is not a publication flag.
- LATASHA and DUTCHYY diagnostic cases with deep PDF qualifications and contradictory dates, plus synthetic long-source controls. Compare required-passage recall and exact citation alignment with full-original controls; do not call two artists a general benchmark.
- A paragraph beyond the former 4,000-character cutoff; complete reading via continuation; no lost Unicode characters; stable references after reordering; changed/deleted source handling.
- Exact previous answers, pending versus skipped questions, sitting/offer chronology and corrections. Current instructions must survive tool-loop pruning and output-budget limits.
- Real no-match, empty/unreadable extraction, database failure and incomplete-corpus cases, with distinct outcomes. Stored reads start zero provider jobs.
- Read latency, response bytes, evidence characters and actual model token usage reported separately. Initial targets: warm read p95 under 1 second, search p95 under 2 seconds on the evaluated corpus; measure before claiming either. Include cold behavior and corpus size.
- Full API gates and actual HTTP/AI SDK client verification. A docs preview demonstrates rendering only; unit mocks demonstrate logic only. Interview question quality and UX remain phase 3.

## Current code evidence

API baseline: merged social-ingestion commit `df3019d5accc02e35af2ce92b36bd5f7495f5568`.

- `lib/auth/authenticateRequest.ts`, `validateArtistEditRequest.ts`, `canEditArtist.ts`: Privy user identity and claimant/admin access.
- `lib/db/schema.ts`: vault sources, own social posts, artist docs, interview answers, corrections and durable jobs.
- `lib/research/postResearchRefreshHandler.ts`, `requestResearchRefresh.ts`: existing mutation behavior; `getResearchJobs.ts` currently suppresses query failures.
- `lib/lore/buildDocContext.ts`: known positional citation mismatch; do not reuse its ranked numeric IDs for the shared evidence interface.
- Web `src/app/actions/interviewActions.ts`: fixed sitting/offer semantics, pending/skip handling and existing context limitations.

[Tracker #1424](https://github.com/xdjs/MusicNerdWeb/issues/1424) remains the current implementation/release record. This document creates no endpoint, changes no permissions and promotes no release.
