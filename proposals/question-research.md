# Question-directed research and artist review

Work in progress for [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424) and [Web#1422](https://github.com/xdjs/MusicNerdWeb/issues/1422). This contract precedes implementation; it does not describe a released feature.

## Delivery and ownership

1. MusicNerdAPI researches a bounded evidence need through existing jobs and providers.
2. API discoveries retain original evidence and remain pending artist review.
3. API supplies exact mandatory interview memory; Web owns authenticated capture of boundaries.
4. Web Ask About consumes API research, displays progress, and lets artists review discoveries.
5. Web's interviewer consumes the shared API and is evaluated on complete, independent cases.

Web owns database migrations. Docs/schema readiness must precede the API release: API main merges currently auto-publish. Draft PRs remain drafts until the owner accepts them. Passing model checks is not editorial approval.

## Research request

`POST /api/artist/{id}/research/questions` accepts a neutral evidence request, not a transcript of the visitor's conversation:

```json
{
  "topic": "DAY 002 production credits",
  "evidenceNeed": "credits",
  "freshness": "stored",
  "targetUrl": "https://example.com/artist/release"
}
```

`topic`: 3–160 characters, naming the public work/topic. `evidenceNeed`: `reporting`, `release_date`, `credits`, `social_caption`, or `spoken_content`. `freshness`: `stored` or `recent`. Optional `targetUrl` must be a supported public HTTP(S) URL; no credentials, IP literals, custom ports or local hosts. Optional `platform`: `instagram`, `tiktok`, or `x`. Optional `fromDate`/`toDate` preserve day precision and bound an account scan; they are filters on publication dates, not assertions about event dates. Unknown fields, raw provider input, arbitrary actor IDs, account IDs and caller-selected budgets are rejected.

Authentication is either the artist's current claimant/admin Privy token or a server-only research credential (`MUSICNERD_RESEARCH_API_KEY`). The latter authorizes public evidence research only, never private history, review-queue listing, boundary writes, approval or profile mutation. It must never reach browser code. Web keeps its public request throttling and the API enforces durable global and per-artist quotas. A missing service credential disables that path with 503 rather than making it anonymous.

Clients can advance only the queued question work with the existing `POST /api/research/advance` body `{artistId, kinds:["question_research"]}`; the queue lease and per-stage reservations also apply to this foreground pump. The scheduler continues abandoned sessions.

The earlier run recorded a 503/unfinished answer. The later finalizer behavior below does not by itself establish that this failure mode is gone; a fresh completed run must confirm it.

A successful enqueue returns HTTP 202 immediately with `{status:"ok", jobId, stage, reused, message}`. The first stage is `checking_saved`; no external request runs inside enqueue. Equivalent active work shares its job. Completed results have a 30-minute freshness cache (five minutes for unresolved results); provider failure is not cached as evidence of absence. A conflicting active request or exhausted quota returns an explicit 429 with retry information, never an empty success.

`GET /api/artist/{id}/research/questions/{jobId}` returns the request's safe status, provider label, update time, limitations and bounded original references. Raw prompts, chat text, account IDs, credentials and provider payloads are not status fields. A different artist's job is unavailable. Reconnecting reads the same job; it cannot start a second scrape. Terminal states stop progress.

## Joined evidence coverage contract — 19 October 2026

This docs-first addition belongs to [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424). It defines the implementation and verification work still to complete; earlier published answer reports remain historical observations, not proof of this contract.

### Public request scope

The shared API request may include `evidenceFacets`, an array of one to four `{id, intent}` objects, for compatibility with legacy callers and jobs. New resolved Web planner outputs require positive evidence facets; a missing declaration must fail closed or clarify, not silently become a legacy request. The host assigns canonical stable IDs `f1` through `fN` in request order. An intent is a neutral, positive requirement for the answer, such as each side of a musical comparison or a named collection together with the relationship the listener asked about. Facets are not facts, private conversation, negative evidence claims, provider instructions or new access permissions.

The planner declares the public subject, constraints and facets before shortening the topic. Each full facet intent must remain as a whole phrase in the public `topic`, alongside the existing public subject, constraints and exclusions, within the unchanged 160-character topic limit. Shared scope validation applies NFKC normalization, case folding and collapsed whitespace with Unicode whole-phrase boundaries; accepted normalized variants need not be byte-for-byte identical. Normalized duplicate facets are rejected. Normalization cannot excuse an omitted clause or a changed relationship. Facets cannot serve as a side channel for information omitted from the protected topic. The host validates the declared shape, canonical IDs and preservation before dispatch. If the complete scope does not fit or the referent is ambiguous, clarify or fail closed; do not truncate, silently drop an exclusion, or paraphrase away a named relationship. Extraction of the visitor's intended scope remains model-dependent, so structural validation alone does not prove that the planner retained every requirement.

For example, a comparison can declare:

```json
{
  "topic": "Aster Vale; early record sound; later record sound",
  "evidenceNeed": "reporting",
  "freshness": "stored",
  "evidenceFacets": [
    {"id": "f1", "intent": "early record sound"},
    {"id": "f2", "intent": "later record sound"}
  ]
}
```

A named Spotify work or collection and the requested relationship must survive planning and selection as that public referent; a Spotify identifier or profile association does not prove an artist's creative role or ownership. The existing raw-conversation exclusion, URL validation, source identity, speaker uncertainty and claimant/service-credential boundaries remain in force.

For a public follow-up, a conversation turn may carry optional `sourceRefs: [{n, url}]` with at most three entries within the existing URL budget. The UI derives these entries from the actual prior answer payload's public sources and retains its exact citation numbers, such as `[3]` and `[4]`. The server validates HTTP(S) URLs, membership in the provided turn's `sourceUrls` and unique citation numbers; it does not add network private-host classification to this conversation schema. The API's existing URL-fetch policy remains a separate boundary. This is structural validation, not independent proof that the supplied conversation came from an authentic historical payload. All provided conversation remains untrusted planner context. Do not infer a citation number from the position of a URL in a deduplicated list. This mapping is planner-only context: it is not raw conversation forwarded to the research API, proof of a fact, or permission to access another source. Facts must still be reopened and checked. Set `targetUrl` only when the follow-up unambiguously concerns the same source. Legacy conversation without this mapping has unknown citation-to-source identity; do not reconstruct it by guessing.

An explicit request with one positive facet retains the direct-candidate path, whose facet coverage remains unknown until independently checked; direct selection does not invent an assignment. A request with two or more positive facets uses the existing ordinary saved navigator so evidence selection can consider every declared requirement; this adds no new navigation mechanism or budget. The existing lexical comparison heuristic applies only to legacy requests without facets. Facet count controls this routing distinction, not an assumed completeness verdict.

### Evidence selection, persistence and reopening

The navigator's `finishEvidence` input supplies `facetCoverage: [{id, referenceIds}]`, using actual read-reference IDs supporting each requested facet. The host validates those IDs against references that were actually read and selected, and requires every selected reference to be assigned to at least one declared facet; a search hit, inventory entry or invented ID cannot satisfy coverage. The evidence assessor's coverage also remains subject to host reference validation. Both produce coverage in exact request order, with no unknown, duplicate or omitted facet IDs accepted as a complete result.

The persisted job state and safe status response use an optional top-level field:

```json
{
  "facetCoverage": [
    {"id": "f1", "referenceIndexes": [0]},
    {"id": "f2", "referenceIndexes": []}
  ]
}
```

`referenceIndexes` are zero-based indexes into that result's finalized `references` array. Each requested facet has one row; an empty array explicitly records missing selected evidence for that facet. The host maps internal read IDs to these final indexes, rejecting invalid mappings. Ephemeral read IDs never escape into persisted public coverage or status. This is separate job-state metadata, not a change to the exploration trace. Status revalidation remaps coverage indexes to surviving references. If any assigned reference is stale or unavailable, it omits the whole optional coverage field, leaving coverage unknown rather than manufacturing a missing-evidence assertion; a stale index cannot silently point at another source. Current revision, identity, privacy and access checks still govern every original read.

An internal, transient `finishedEvidence: true` distinguishes deliberate terminal evidence selection from an unfinished navigation attempt. For requests with facets, `sufficient` means all declared facets have assigned evidence; a useful partial selection therefore has `sufficient: false` and explicit empty coverage rows. The worker accepts `finishedEvidence || sufficient`, retains useful selected references and completes the selection stage without starting outside research or another navigation pass. A complete job stage means selection is ready for the writer, not that all requested evidence was found or the answer is complete. This adds no public lifecycle state or exploration-trace key; `finishedEvidence` is not persisted public coverage. Facet-free legacy behavior is retained without acquiring a completeness claim.

Coverage is assigned by a model. A structurally valid nonempty row means evidence was selected for a requirement, not that the source proves that requirement or that the answer addresses it. An absent coverage field in a legacy job means unknown coverage, never complete coverage. Request binding and reuse must retain the declared facets; an answer or job created for a different scope cannot acquire a completeness claim from a later request.

### Checked answer and visible gaps

Web reopens the eligible originals and uses the existing checker call to independently assess the current answer's requested facet coverage against those originals. The checker must return a complete partition of the known requested IDs into covered and missing sets: no unknown IDs, duplicates, overlap or omitted IDs. Coverage cannot override a failed factual, exact-quote, revision, speaker, identity or privacy check. It must describe the current checked answer, including after repair, rather than a prior draft or the API's evidence-selection claim.

A useful supported partial answer may be shown with a clear indication of its missing requirements. Any missing-facet notice uses only the host-validated public intent and the validated process status. It does not render raw `unanswered` text, model-authored absence claims, or private conversational context. A missing facet describes what this answer has not established; it is not proof that the fact, source or relationship does not exist. Legacy unknown coverage is not labelled complete.

Within the existing repair allowance, remove or narrow an unsupported relationship while retaining independently supported useful detail and its source identity. Do not replace the requested work or relationship with biographical padding merely to produce an answer. A partial answer still requires the existing final factual verdict for every sentence that is returned; do not revive an unchecked subset of a rejected draft.

A zero-sentence draft still returns the existing fixed no-information result immediately without a checker call. A factually approved partial answer does not receive a second draft/check cycle merely because facets are missing; it returns with the validated scoped coverage notice. This change adds no model stage, extra draft/check cycle, automatic restart or higher call, time, character or spending limit. Existing zero-citation candidate continuation remains zero-only and preserves the same job and lifetime. Missing facet coverage in a nonempty answer does not itself trigger continuation or collection. Ordinary research, operational failure and the separate request-bound semantic reuse fallback retain their existing boundaries.

### Verification plan — not executed evidence

| Boundary | Required verification |
|---|---|
| Planner to public request | Join the actual normalization and API serialization path with scripted model output. Preserve both named comparison sides, a named collection and its requested relationship, and an existing negative constraint. Reject malformed/colliding IDs, normalized duplicate facets and absent whole-phrase intents after the shared normalization. New resolved plans without positive facets fail closed or clarify; legacy API omission remains accepted. An over-160-character complete scope clarifies without truncation. Assert no raw history or planner-only private fields cross the API boundary. These scripted cases prove wiring, not reliable model extraction. |
| API request and selection | Accept an omitted field for legacy callers and one to four canonical facets for new callers. Reject invalid facets before work is queued. Test that a single facet retains direct selection, two or more facets enter existing ordinary navigation, and only legacy facet-free requests use the comparison heuristic. Both paths must preserve scope and cannot treat one covered side as complete coverage. |
| Read IDs to final references | Test valid shared references across facets, explicitly missing rows, unknown/unread IDs, duplicate or omitted facet rows, reordered/deduplicated references and out-of-range indexes. Assert exact request order and no internal read IDs in persisted state or status. |
| Status and original reopening | Reopen the requested revision through the existing authorized service. Drop or reject a revoked, identity-rejected, changed or unavailable original according to the existing contract, and verify coverage remapping cannot transfer support to another source. Any stale assigned reference makes the optional coverage field unknown, not falsely complete or falsely missing. Legacy missing coverage stays unknown. |
| Writer, checker and repair | Supply evidence selected for both facets but a draft that answers only one. Verify independent checker coverage, the complete known-ID partition and a supported partial answer's scoped notice. Reject invented coverage and unsupported relationships despite a claimed covered facet. Repair may narrow/remove the relationship, but cannot substitute unrelated biography or restore a rejected attribution. |
| Actual visitor display | Join the real client, request/status handlers, API adapter, reopened originals, writer/checker and renderer with explicit fixture seams. Verify useful partial text, source links and missing public intents; never expose raw unanswered/private text. Include an unambiguous named-work follow-up and an ambiguous referent that clarifies. Preserve actual prior citation numbers when URL order differs or URLs are deduplicated; reject duplicate numbers, non-web schemes and URLs absent from the provided turn's `sourceUrls`, respect the three-entry URL budget, and keep absent legacy mappings unknown. Assert UI derivation from the actual payload separately from server structural validation of untrusted conversation. Assert this planner-only mapping does not become API raw history or factual authority. |
| Limits and historical evidence | Assert unchanged model-call ceilings and that a deliberate partial finish retains its references, completes selection and does not queue another pass or outside lookup. Distinguish finished selection from unfinished navigation and from fully assigned evidence. Keep every earlier error and report unchanged. Any separately authorized real-model confirmation must pin inputs and code, report actual request/selection/answer coverage and usage, and remain an observation rather than a release or issue-closure claim. |

## Planner task and answer repair amendment — 19 October 2026

This amendment follows the completed but unaccepted coverage-v1 observation. It preserves that report and the preceding joined-coverage contract as historical evidence. The observed failures motivate the changes below; they do not establish that these changes have passed a model evaluation or are released. This is a Web planner/writer/checker correction with no API contract or runtime change.

### One planner call, explicit task structure

Within the same planner call, `researchTask` is a discriminated task rather than an unconstrained list that can collapse a comparison into one requirement:

| Task branch | Required positive scope |
|---|---|
| Ordinary | The positive evidence requirements needed to answer the question. |
| Comparison | Two to four complete, neutral clauses, one for each requested side. Each clause retains its subject or period and the musical relationship/dimension being compared. “Early records” and “later records” are valid when the listener has not named works; do not guess titles merely to populate the sides. |
| Recommendation | The scope of the listening choice and a complete, neutral evidence requirement for a source-supported reason tied to that same choice. Both clauses become facets verbatim, without a hidden prefix. The reason is an evidence requirement, not an invented endorsement or a presumption that a particular work is representative. |

The host derives the existing canonical `evidenceFacets` and protected `topic` from the declared task. Negative constraints and exclusions remain separate constraints and must still survive in the public topic. The existing one-to-four facet limit, normalized whole-phrase validation, source/identity/privacy boundaries and 160-character topic cap remain unchanged. If the full neutral task cannot fit, clarify or fail closed rather than truncate a side, drop a relationship or send extra task text outside the protected topic. The planner-only task structure does not enter the API request or forward raw conversation. Host validation proves the declared structure and preservation, not that the model classified the listener's intent correctly. Correct model classification remains a requirement to observe in evaluation; a valid schema cannot prove it.

A collection may be offered as a modest listening entry point when the source describes its contents and provides a concrete rationale relevant to the listener. A production credit alone is not proof of a best, representative or signature work, nor of ownership or the artist's sound. Preserve a named collection's public source identity and tie any recommendation reason to that actual choice; do not substitute an unrelated biography when the requested relationship is unsupported.

### Shared temporal rule

The writer and checker use the same temporal evidence rule. A dated account of ongoing status or mutable playlist or collection contents does not establish that status or those contents continue today. Statements such as an artist “keeps” a collection, its “latest” contents, or “recent” activity require a source reporting frame unless the cited evidence establishes the claimed continuing truth. Attribute an older description to its account or reporting period instead of silently updating it to the present. An older source can still support a recommendation today or a timeless trait of a fixed recording. This does not require attaching dates to timeless musical observations or every factual sentence, and it does not authorize an automatic refresh.

### Exhaustive first check and whole-draft repair

The first existing checker call evaluates every clause, required qualification, exact supporting quote and attribution in the entire current draft. Its feedback enumerates all concrete clause/source defects it detects, including temporal scope and relationships, rather than postponing checks until repair. This instruction cannot guarantee an exhaustive model verdict; deterministic quote, revision and final-verdict enforcement remains necessary.

The one existing repair attempt preserves valid claims and quotes unless a specific identified defect requires a change, while reevaluating the entire answer, including sentences previously approved by the first check. Normal transitions and contextual connections may remain; sentences do not have to stand alone. Supported sentence IDs are repair hints, not factual authority, a standalone-sentence requirement or permission to publish a subset. Previous approval is not a permanent exemption from the full recheck. When the supplied original contains the needed support, add the exact available quote and repair any scope mismatch; otherwise narrow or remove the unsupported claim. A musical description present in the original but absent from the selected quote has a quote-coverage defect, not established factual falsity or absence of source evidence. Keep a contrast concise without turning the answer into an unrelated catalog of facts. The final checker may reject a newly noticed problem, but a changed verdict must concern the actual repaired answer and current evidence, not an attribution that was removed.

This amendment adds no attempt, checker cycle, subset publication, automatic restart, collection step or higher limit. A factually approved partial answer still returns with validated coverage rather than triggering a coverage-only repair. A final unsupported draft still fails closed; previously approved text is not silently published as an unchecked subset. The existing zero-sentence immediate fixed result and zero-only candidate continuation remain unchanged.

### Bounded verification plan

- Join scripted planner output through host normalization and actual API serialization. Exercise comparison sides with named works and unnamed early/later periods; recommendation choice plus same-choice rationale; and ordinary requirements. Confirm the existing facet order, complete normalized clauses, exclusions and 160-character failure behavior. Reject malformed task branches without guessing a replacement task. Do not claim this scripted proof demonstrates reliable live task classification.
- Exercise one dated source describing collection contents: unqualified present/latest language must be repaired to its reporting frame or omitted; unchanged timeless musical detail must not acquire a forced date. Preserve the specific collection and source identity through follow-up planning.
- Check drafts with multiple concrete clause/source defects and missing exact quotes. Verify that repair retains valid claims, quotes, transitions and context unless a specific defect requires change, rechecks the full answer, can add an available quote or narrow a relationship, and cannot treat first-pass approval as a bypass. Include a source-supported musical description missing its selected quote, a retained supported contrast and a final unsupported sentence that prevents unchecked subset publication. Supported sentence IDs must not force standalone prose or authorize subset publication.
- Assert unchanged call/attempt ceilings, no new collection or restart, and no coverage-only second cycle. Preserve all coverage-v1 failures. Any separately authorized real-model confirmation must report the actual planner task, selected evidence, repaired answer and both checker verdicts; neither a new prompt nor a scripted test is itself a new pass.

## Stored evidence first

The worker searches original text and reads surrounding context before deciding whether external research is needed. Approved public URL Lore and own public social posts are eligible. Uploaded/private material and exact interview history are excluded from public research, even when the same server credential is used by another agent. Claimant interview tools retain their separate richer authorization boundary. Metadata and generated summaries do not establish facts.

Public saved-source selection returns up to four original windows, with at most two from one source so a long interview cannot crowd every shorter matching source out. General questions use stored evidence; clients must not invent a recent-only window or drop requested source/attribution constraints while translating a question. Search returns stable source/revision/UTF-16 positions. A bounded evidence check must resolve its support to exact original passages. Credit questions may use one distinct intent-ranked original within the same four-window and character limits. Do not describe a credited producer as owning or representing the artist's sound or story merely because they have a production credit. Make that connection only when verified evidence supports a specific musical or narrative role; otherwise preserve the selected evidence gap. For legacy requests without facets, relevance-ranked reporting requests without a target URL or a negated topic use the existing heuristic: explicit comparisons of musical sound across records bypass the direct-candidate shortcut and enter ordinary model-driven research, even when a service caller requests direct evidence. This avoids treating a few keyword-ranked passages as a sufficient view of changes across records. These requests do not reuse candidate-only jobs; completed ordinary research remains reusable under the existing cache rules.

Ordinary saved-navigator search returns initial context in windows of at most 1,000 characters each and at most 4,000 characters per search. This is the initial context budget only; it does not reduce the limits for an explicit targeted read. Targeted reads remain capped at 4,000 characters per source and 12,000 characters per read call, with a 24,000-character original-text aggregate for each saved-navigation pass, at most 12 tool calls and five model steps. The internal browse, search and read tool results include the remaining applicable character budget so the agent can stay within those limits. These accounting fields are internal and do not change the public request shape or status response.

The existing navigator first explores saved public originals and may request an existing server-validated outside lookup only after saved evidence is insufficient, subject to the existing quotas and budgets. All eligibility and explicit request constraints still apply; this does not expand source access. A nonempty search is not by itself sufficient evidence. Within the existing five-model-step cap, reserve the last two calls for completion: three exploration calls followed by up to two completion attempts. A remaining budget of three calls allows one exploration and two completion attempts; two calls allows one of each; one call allows completion only. Each step reports the applicable remaining counts. Reserve two of the existing twelve tool invocations for finishing, so exploration cannot consume those slots. Before completion, prioritize reading promising known sources; text search ranks source-body passages, while the inventory provider filter browses a publication. Completion exposes only `finishEvidence`, `requestLookup`, and `finishUnresolved`, with automatic tool choice and the original evidence rules retained. An unavailable exploration action or malformed tool input is not executed; invalid read reference IDs cannot add evidence. Error feedback allows correction within the remaining reserved call, without a sixth call or an additional loop. `finishEvidence` selects only actual read reference IDs supporting a useful scoped answer. `requestLookup` requires a genuine gap and an available, authorized lookup; `finishUnresolved` requires a specific gap grounded in the read evidence. No justified finishing action, repeated invalid actions, worker stops and budget exhaustion remain operational failures, never proof of absence or a fabricated partial answer. An unavailable database is a failure, not proof of a missing fact. A fresh-post request cannot be satisfied by undated or old material merely because words match.

## Provider choice and budget

Routing follows implemented capability, not arbitrary model-generated actor input:

| Need | Route and limits |
|---|---|
| Readable original already stored | Reuse it; no new provider request |
| Explicit article/release URL | DNS-pinned original reader with redirect validation; up to 50,000 characters |
| Reporting or historical context | One web discovery request, up to five hits; at most three original pages read |
| Release dates / credits | Stored liners/credits first; official artist/label/Bandcamp originals and correctly identified catalog records; preserve edition, work/track and date precision |
| Explicit IG/TikTok/X post | Validated platform adapter and connected-account ownership check; no foreign/reposted speech attributed to the artist |
| Recent account posts | Only an existing verified account, bounded items/date range; a scan is not exhaustive history |
| Needed IG reel speech | Existing supported reel-transcript adapter, separately labelled provider transcript with unverified speaker |
| TikTok/X audio, vision, arbitrary podcast/YouTube transcription | Explicit unsupported result in this slice; captions/titles are not substituted for speech |

A route publishes its `searching`, `reading`, or supported `transcribing` stage before the external call. Web can explain the transition before waiting. An ambiguous paid POST is checkpointed before sending and is never automatically restarted; an unknown outcome remains explicit. Saved run IDs are polled/collected on later slices. Leases, ownership changes and stale checkpoints prevent late writes. Wall-clock expiry and finite provider/model call caps bound the job. Actual usage and elapsed time are recorded; charge caps are limits, not claims about actual spend.

The durable quota is five new requests per artist and 100 globally per rolling 24 hours. Initial caps are conservative: one web search, three original reads, one social actor run (maximum 20 posts or one reel), two evidence-assessment model calls, and 15 minutes of wall-clock job lifetime. Social run charge ceilings reuse the verified actor minimums. New structured MusicBrainz/Discogs credit adapters require separate capability verification; this slice does not claim them. Search can locate their exact release pages and read them when accessible.

## Durable discoveries

`artist_research_candidates` is one review item per artist and canonical URL. It contains a neutral reason code, destination (`lore` or `link`), identity state, current curation state and audit references. `artist_research_evidence` stores immutable original versions with a revision, original text, bounded provenance, retrieval date, publication date when known, extraction limits and speaker uncertainty. Refresh does not overwrite a cited version. The candidate’s current-revision pointer follows the last observed content, including a reversion to an older retained original; artist approval has its own reviewed-revision pointer.

An article, interview, release page or individual post is a Lore candidate. A supported account homepage is a Links candidate. Curation is separate from identity/readability: a pending but identity-checked public original may support a clearly labelled public answer; it cannot silently enter approved-only interview Lore. Unknown identity remains withheld from public answers. A decline is a curation choice; `wrong_artist` and `incorrect` are distinct decisions. All suppress automatic resurfacing. Artist approval is not proof of every sentence in a source.

`GET /api/artist/{id}/research/discoveries` and `POST /api/artist/{id}/research/discoveries/{candidateId}/review` require current claimant/admin auth. Review names the exact evidence revision and expected current state. Acceptance is atomic with the audit record and the appropriate Lore/Links write; existing account conflicts are explicit. The initial review accepts only a retained readable original, so approval already has its body; metadata-only hits are not reviewable evidence. Existing approved-source ingestion remains the path for subsequently added unreadable links. Failed/competing review cannot partially promote a candidate. Claim changes are rechecked under the artist lock.

`GET /api/artist/{id}/research/evidence/{evidenceId}` accepts a URL-encoded source ID (`discovery:UUID`, `vault:UUID`, `social:UUID:caption|transcript`), revision and bounded UTF-16 window; bare discovery UUIDs also work. Current public Lore/social reads return 409 if the revision changed; retained discovery originals can reopen eligible older revisions. Public research auth can read only eligible public evidence; review auth can inspect unresolved pending originals. Deletion or an identity/factual rejection blocks subsequent reads, including old citations. A changed or unavailable original is explicit; never silently substitute a new revision.

## Agent tools

`createQuestionResearchTools` binds trusted API origin, artist and credential callback on the host, validates responses, and exposes `requestArtistResearch`, `getResearchStatus` and `readArtistSource`. This is the public research toolset; the existing claimant-only `createArtistKnowledgeTools` remains the private knowledge/history toolset. Their overlapping names have different scopes and must not be blindly spread together. The Web interviewer integration will give them distinct names or route them explicitly. Credentials, provider inputs and approval are never model-selected tool arguments.

## Mandatory interview memory (separate API slice)

The detailed [memory contract](interview-memory.md) specifies the mandatory read, explicit scoped boundary capture/retraction, exact-field pagination and host completeness gate.

A claimant/admin memory read returns the latest exact persisted answer, all applicable corrections and active explicit topic boundaries, plus completeness and a continuation when needed. Boundaries retain the artist's exact wording, originating answer/turn, scope, lifetime and retraction. A skip alone does not create a permanent boundary. No generic autonomous memory-write tool is added.

Web injects this memory and the latest exact unsaved answer on every turn, including retries and context pruning. Older permitted answers are retrieved through shared history tools as needed. Missing/partial/error memory prevents a question from being presented as fully checked. Offer/sitting chronology is fixed independently from answer update timestamps.

## Web and acceptance

Ask About immediately displays “Checking saved sources…”. A persisted evidence gap produces a concrete outside-Lore notice naming the actual route. Jobs survive navigation; completed public sources and their real curation state can be reused in a fresh session. The artist's review card includes original context and a neutral relevance reason, never the visitor's private conversation.

The interviewer reads shared API evidence and mandatory memory before selecting an angle, drafting one useful question, and checking its premises. Evaluate retrieval → original reading → angle → draft → check, not just a final model verdict. Use production-derived LATASHA and DUTCHYYY evidence for regression and separately freeze independent cases before tuning. Include misleading headlines, reposts, namesakes, edition/date confusion, unused credits, corrections/refusals, paraphrased repetition, unavailable originals and false rejections. Record usefulness, unsupported premises, lost qualifications, repetition, latency, provider/model usage and cost. Human editorial review remains a release criterion.

The writer and checker apply the same evidence rule: a source failing to mention a fact does not support a cited absence claim, even when phrased as a limitation of these sources. A cited limitation requires an explicit supporting source statement; unsupported gaps belong in the undisplayed unanswered field. If the selected originals support no relevant answer detail or explicit limitation, the writer returns zero sentences; existing zero-citation handling can continue candidate research. Ordinary research zero does not restart navigation; the separate semantic-reuse fallback requires a persisted request binding. Candidate continuation preserves the same job, lifetime and answer-attempt count. Checker errors and failed attempts are not converted to that outcome, and useful positively supported details remain eligible.

The Web writer has a two-attempt total draft/check loop and a separate 45-second timeout. If the first checker result is partial, use the one remaining attempt for source-grounded repair and quote-level/factual recheck. If the final check still finds unsupported content, fail closed rather than return an unchecked subset as verified. This Web writer loop is separate from the API navigator's five-step ceiling above.

Follow-up planning preserves unambiguous named works and the relationship being investigated in the bounded public research task, including both sides of a comparison. Prior conversation resolves what the listener means; it does not prove the musical claims. The planner must not replace named comparison targets with generic stylistic labels, carry unrelated works forward, or guess an ambiguous referent.

The checker evaluates the current draft against the full supplied original passages for each cited source, without importing assertions removed during repair. Its repair reason distinguishes contradiction, unsupported assertions, missing quote coverage, and attribution or qualification repair. A claim supported elsewhere in the supplied passage but missing a supporting quote needs an additional exact span and rechecking, not automatic acceptance or deletion. A literal unidentified credit does not identify the speaker; absence and ownership claims are evaluated separately. These instructions do not change exact-quote, revision, privacy, identity or final-verdict enforcement.

For listener answers, instruct the writer to lead with the most useful supported insight, then add source attribution where it is needed to distinguish an artist's account from a reviewer's or interviewer's interpretation. This changes presentation order only: exact source, revision, quote and factual-support checks remain unchanged.

Identical retained text at the same canonical URL and evidence kind is deduplicated before public selection, preferring its approved copy. Promotion therefore does not make the same original occupy two result slots.
