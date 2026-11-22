# Portfolio RAG Chatbot: Evaluation Results

One row per run of the evaluation set (decision D13). Each row is produced by
`python -m eval.run_eval` in the `portfolio-chatbot` repo.

**Columns**
- **Retrieval hit:** the expected page appears in the top 4 chunks.
- **Answer acc:** required facts present and no forbidden claims (answerable and status questions).
- **Unanswerable clean:** the bot refused and invented nothing.
- **Off-topic refusal:** the bot declined.
- **TTFT / Total:** median time to first word and to the full answer.

## Retrieval tuning (search only, no language model)

The first four runs used a local copy of the site content built from the
Markdown sources, because the real export is built by GitHub. The last run
repeats the final settings on the real `chatbot-content.json` from CI and
gets the same result.

| Date | Change | Retrieval hit | Settings | Notes |
|---|---|---|---|---|
| 2026-11-12 | Baseline: meaning search only | 95% (18/19) | top_k=4, min_score=0.35 | Missed "When does he graduate?" (expected page ranked 5th) |
| 2026-11-12 | + query prefix (D15) | 95% (18/19) | top_k=4 | Fixed the graduation miss and 3 other rankings, but "computer vision project" dropped from rank 4 to 7 |
| 2026-11-12 | + keyword bonus 0.2 (D16) | 100% (19/19) | top_k=4, keyword_weight=0.2 | Weights 0.1, 0.2, and 0.3 all scored 19/19; 0.2 chosen as the middle value |
| 2026-11-12 | + overview documents (D18), 2 new questions | 100% (21/21) | top_k=4, min_score=0.5, keyword_weight=0.2 | "What programming languages does he know?" now retrieves the skills overview at rank 1 |
| 2026-11-12 | Same settings, **real** `chatbot-content.json` from CI | 100% (21/21) | top_k=4, min_score=0.5, keyword_weight=0.2 | Real export has the same 28 document ids as the local copy; result confirmed |

**What the score probe showed (D17).** With this embedding model, the best
chunk for a real question scores 0.57–0.87 and the best chunk for an
unanswerable or off-topic question scores 0.44–0.72. The ranges overlap, so a
score cut-off can't tell them apart on its own. With `min_score=0.5`, only 2
of the 11 unanswerable and off-topic questions get no chunks ("weather" and
"ignore your rules"). The other 9 depend on the prompt rules, which the
answer runs below will measure.

## Answer runs (with a language model)

| Date | Label | Model | Retrieval hit | Answer acc | Unanswerable clean | Off-topic refusal | TTFT | Total | Notes |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | No runs yet. Model selection happens after the Space is deployed. |
