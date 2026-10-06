# Original-passage retrieval revision

October 5, 2026. Pete authorized starting the next retrieval step after production-data checks. Owned by [Web#1424](https://github.com/xdjs/MusicNerdWeb/issues/1424); implemented through the existing draft [API#20](https://github.com/xdjs/MusicNerdAPI/pull/20). No Web interviewer, ingestion write, schema, model or provider change is proposed in this revision.

## Problem and baseline

Equal-weight word overlap can rank incidental words above a distinctive name or attribution. A nearly exhausted character budget can return an unusable fragment. The existing 16 production-based development cases cover every designated original span in 10/16 default searches, 11/16 larger searches and 13/16 after three bounded surrounding reads. Source reopening is exact; retrieval selection remains incomplete.

## Contract

- Keep the six read operations, authentication, schemas and character/byte limits unchanged.
- Rank overlapping windows of original text using corpus term rarity, saturating term frequency and length normalization (BM25, k1=1.2 and b=0.75), plus three times the inverse document frequency of each adjacent non-stopword query pair. Normalize case, Latin accents, within-word apostrophes and English word forms for matching; never normalize returned evidence or offsets. The scoped artist name is omitted when other query terms remain. Titles/descriptions remain metadata, never passage text or independent evidence.
- Preserve deterministic ties, source/revision identity, exact UTF-16 offsets and explicit coverage/truncation. A ranked window must still contain a query match after any budget reduction.
- Do not emit a budget-clipped passage shorter than 256 characters. Complete naturally short evidence remains eligible. Stop or skip a candidate explicitly when the remaining budget cannot provide usable context; do not pad with metadata.
- Original reading remains explicit through `readArtistSource`. The consumer should inspect a document's opening for authorship/scope, then relevant surrounding passages and qualifications. A rank score does not establish speaker identity, completeness, factual support or a connection.

BM25 is a candidate lexical improvement, not a commitment to a vector/graph service or a general retrieval-quality claim. Use fixed conventional parameters before evaluating new cases. [Stanford's IR reference](https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html) describes term rarity, frequency saturation and length normalization; final acceptance depends on the Music Nerd evidence below.

The initial BM25-only candidate introduced two context-reading regressions. Development regressions and synthetic unit cases motivated English inflections, phrase weighting and scoped-name handling; the phrase weight is an engineering heuristic, not part of standard BM25. English stemming uses the pinned `stemmer@2.0.1` package ([implementation](https://github.com/words/stemmer)). Non-English morphology and semantic equivalence remain limitations. Transfer annotations were frozen before changes, but their aggregate results were observed during candidate comparisons; this is not a blind benchmark.

## Verification

1. Keep fresh read-only production snapshots of Dutchyyy and LATASHA as the development baseline, including the PDFs. Preserve the 16 frozen queries and exact reference spans.
2. Freeze additional cases on four other production artists before editing ranking. Record corpus/annotation hashes, selection method and who authored labels. These are additional regression/transfer cases; they are not independently human-annotated or a blind editorial benchmark.
3. Run the old and candidate code against identical snapshots, queries and budgets. Separately report direct search and the same deterministic surrounding-read control. Preserve regressions, missing originals, tiny fragments, exact reopens, CPU time and response characters. No model approval or source-location oracle selects passages.
4. Add synthetic unit regressions for rare-term ranking, name normalization, misleading metadata, Unicode/offset preservation and exhausted budgets; run red before implementation, then the complete API gate.
5. Verify the changed code on its exact preview through authenticated HTTP/tool reads. Production snapshots validate evidence retrieval; staging verifies deployment/auth. No preview is connected to production credentials.

Durable missing-source ingestion, historical versions, boundary persistence and full-process human/held-out interview evaluation remain separate tracked work. This document does not claim they are implemented.
