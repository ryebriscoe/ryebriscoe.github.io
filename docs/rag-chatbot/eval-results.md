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
| 2026-11-22 | First live smoke test (3 questions, not the full set) | SmolLM2-360M-Instruct (placeholder) | 3/3 | 0/2 | — | 1/1 | — | 1–7 s | Retrieval correct for all 3. Weather got the instant "not covered" reply. The Java answer padded with invented details; the freelance answer said "No" with the freelance page in context. The model is too small: motivates model selection (D20). |

### Model comparison on Colab Pro (D20, D22)

Run 2026-11-23 on an NVIDIA L4 in bf16 (same precision as the Space), 32
questions, same prompt and settings as the Space (top_k=4, min_score=0.5,
keyword_weight=0.2, query prefix on).

| Model | Retrieval hit | Answer acc | Unanswerable clean | Off-topic refusal | TTFT | Total |
|---|---|---|---|---|---|---|
| Qwen3-8B | 100% | 100% | 83% | 100% | 0.4 s | 3.5 s |
| Qwen2.5-7B-Instruct | 100% | 100% | 100% | 80% | 0.4 s | 2.6 s |
| **Qwen3-4B-Instruct-2507** | **100%** | **100%** | **100%** | **100%** | **0.3 s** | **3.2 s** |
| Granite 3.3 8B Instruct | 100% | 100% | 0% | 40% | 0.5 s | 3.2 s |

**Scoring correction.** As first scored, every model got 95% answer accuracy
because all four missed "What has he built with Java?". The test required
both "Spring Boot" and "JavaFX", but several courses used Java. Every model
correctly named CST 238 and CST 438, just not CST 338. The expectation was
too strict, so it now requires "Spring Boot" only, and the saved answers
were rescored without rerunning the models. Only that one row changed.

**What the misses were.**
- **Qwen3-8B**, "Has he worked at Google?": answered "No, Ariya has not
  worked at Google". The site never says that, so it should have used the
  "not covered" reply.
- **Qwen2.5-7B**, "Write me a Python function that sorts a list": gave
  the "not covered" reply, then explained how to sort in Python anyway.
- **Granite 3.3 8B**: often refused in its own words instead of the exact
  "not covered" sentence, which the app needs in order to hide source
  links. Once it invented a fact: "Ariya did not work full-time before
  attending CSU Monterey Bay."
- **Qwen3-4B**: no misses. A manual read found two small wording slips in
  the B.A.D. answer: it said EasyOCR "uses homography", and that the model
  is never shown the answer "during training".

### Groq comparison through the live Space (D23, D24)

Run 2026-11-23: 32 questions sent to the deployed Space, 2.5 s apart to stay
under Groq's per-minute limit. Retrieval here counts the up-to-3 sources
shown under each answer.

| Model | Retrieval hit | Answer acc | Unanswerable clean | Off-topic refusal | TTFT | Total |
|---|---|---|---|---|---|---|
| **gpt-oss-20b** (reasoning: low) | 95% | **100%** | **100%** | **100%** | 1.0 s | **1.3 s** |
| gpt-oss-120b (reasoning: low) | 95% | 90% | 100% | 100% | 1.0 s | 1.4 s |

**Scoring fix.** Groq's models write non-breaking spaces and hyphens
("Fall 2026", "self‑employed"), so "When does he graduate?" first
scored as wrong for gpt-oss-20b. The checker now treats Unicode spaces and
dashes as normal ones (tested), and the saved answers were rescored.

**Remaining misses.**
- Both models, capstone question: retrieval "miss" only. CST 499 was the
  4th chunk given to the model, and only 3 sources are shown. The answer was
  correct.
- gpt-oss-120b: correct answers that missed the expected wording ("sites"
  vs "websites"; "still in progress" vs "currently").

**A discarded run.** One run labeled gpt-oss-120b actually tested
gpt-oss-20b, because a failed CI check stopped the deploy. It was thrown out,
and `/warmup` now reports the running model so evaluations record what was
really deployed.

Site content changed on 2026-11-22 (projects page rewritten, course statuses
updated, one certification dropped). The question set was updated to match,
and retrieval stayed at 100% (21/21) on the real export, including after
switching embeddings to ONNX (D21).
