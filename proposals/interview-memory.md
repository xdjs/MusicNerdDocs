# Mandatory interview memory

Implementation contract for [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424) and [Web#1422](https://github.com/xdjs/MusicNerdWeb/issues/1422). This is the third accepted delivery slice after question research and pending discoveries. It is not released.

## User-visible behavior

An interview resumes with the artist's latest exact saved answer, all saved corrections and the explicit topic boundaries that apply to the current sitting. A skipped question does not silently become a permanent topic ban. The artist can explicitly ask to avoid a topic for this sitting or until they retract that instruction. Their wording remains exact. A new session restores these records. Older permitted questions/answers stay available through the existing history endpoint so the interviewer can identify paraphrased repeats.

The Web interviewer receives mandatory memory before angle selection and again on each new turn, retry or context rebuild. Its newest unsaved answer is an additional exact host-supplied input. The model cannot choose to omit this memory, set its own artist identity, or write/retract boundaries through a tool.

## API ownership and authentication

MusicNerdAPI supplies three operations. Web owns the boundary table migration and the explicit boundary-capture UI. All operations require the existing current claimant/admin Privy authorization, checked again inside the database transaction. The public research service credential does not grant access. Responses use `private, no-store`; storage errors never become an empty memory result.

- `GET /api/artist/{id}/interview/memory?sitting=N&maxChars=12000&cursor=...` reads mandatory exact memory. The trusted client supplies the sitting from the latest persisted offer or the next sitting it is preparing. The API rejects an older sitting or a future sitting beyond the next known sitting, preventing a stale session from omitting current boundaries. This is a host prerequisite, not an optional model tool.
- `POST /api/artist/{id}/interview/boundaries` stores an explicit instruction: `{requestId, questionKey, wording, scope}`. The request ID is a client-generated UUID for idempotency; `questionKey` must identify an existing offered question for this artist. `wording` is 1–4,000 exact characters; `scope` is `sitting` or `until_retracted`. The API derives the originating answer ID and sitting from the persisted offer. A replay with different input is a conflict, not a silent edit. Fifty active records is the supported ceiling.
- `POST /api/artist/{id}/interview/boundaries/{boundaryId}/retract` takes `{revision}` and records retraction with attribution. It does not rewrite the original instruction. A repeated retraction of that same revision is idempotent; another artist's record is unavailable.

The boundary origin records the question key, answer-row identity, fixed sitting, exact offered question and creation/retraction attribution. Offer `sitting` and `offered_at` remain fixed when answers are saved. Boundary creation/retraction and their audit events commit atomically under the artist lock. Browser database roles receive no access.

## Memory pages and bounded context

A read uses one repeatable database snapshot of the newest answered row (by answer update time, with deterministic tie-break), all saved corrections, and unretracted boundaries applicable to the requested sitting. A `wrong` correction preserves the original rejected claim and a null replacement; it is not an empty correction. The API loads no Lore corpus or provider data to serve this request.

The response identifies a content-based snapshot revision, latest-answer identity/revision and expected record count. Records have stable IDs, revisions and exact fields: question/answer, claim/correction or boundary wording. Windows report UTF-16 start/end/totalChars and completeness. The latest answer is first, followed by corrections and boundaries in deterministic order. A budget of 1,000–20,000 characters controls a page, not which mandatory records are considered relevant. No summary or top-k retrieval replaces them.

A continuation is bound to the artist, sitting and content revision. Concurrent answer/correction/boundary changes invalidate it with 409; the host restarts the read. An empty complete response is distinct from a missing, partial or failed response. `constraintsComplete` is true only when the response itself contains every required field; a paginated host must assemble and validate every page before asserting completeness.

A host helper restores all fields and verifies contiguous offsets, revisions and record counts. It enforces a fixed 32,000-character ceiling on the serialized assembled records, including metadata, and a total deadline. If either is exceeded it returns an explicit failure; it never silently trims an answer or drops a correction/boundary. The interviewer withholds a new generated question until memory is complete. Older answers are retrieved separately when useful, within the remaining evidence budget.

## Verification before Web acceptance

Use real SQL tests for exact answer/correction preservation, scoped boundaries, idempotent writes, atomic audit failure, ownership changes, retraction and browser-role denial. Test long fields crossing page boundaries, surrogate pairs, changed snapshots and host exhaustion. After creating memory through an authenticated client, reload with a fresh client and compare exact words and active boundaries. Then test the complete interviewer on production-derived LATASHA/DUTCHYYY originals and independent cases: paraphrased repetition, a corrected premise and a topic refusal must survive a new session. API restoration alone does not establish editorial usefulness or repetition prevention.
