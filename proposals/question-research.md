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

## Stored evidence first

The worker searches original text and reads surrounding context before deciding whether external research is needed. Approved public URL Lore and own public social posts are eligible. Uploaded/private material and exact interview history are excluded from public research, even when the same server credential is used by another agent. Claimant interview tools retain their separate richer authorization boundary. Metadata and generated summaries do not establish facts.

Public saved-source selection returns up to four original windows, with at most two from one source so a long interview cannot crowd every shorter matching source out. General questions use stored evidence; clients must not invent a recent-only window or drop requested source/attribution constraints while translating a question. Search returns stable source/revision/UTF-16 positions. A bounded evidence check must resolve its support to exact original passages. Credit questions may use one distinct intent-ranked original within the same four-window and character limits. Do not describe a credited producer as owning or representing the artist's sound or story merely because they have a production credit. Make that connection only when verified evidence supports a specific musical or narrative role; otherwise preserve the selected evidence gap. For relevance-ranked reporting requests without a target URL or a negated topic, explicit comparisons of musical sound across records bypass the direct-candidate shortcut and enter ordinary model-driven research, even when a service caller requests direct evidence. This avoids treating a few keyword-ranked passages as a sufficient view of changes across records. These requests do not reuse candidate-only jobs; completed ordinary research remains reusable under the existing cache rules.

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
