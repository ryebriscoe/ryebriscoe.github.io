# Portfolio RAG Chatbot: Design Spec

**Author:** Ariya Briscoe
**Date:** 2026-11-10
**Status:** Implemented and live 2026-11-23 (see decisions D20–D25 for changes since approval)
**Implementation plan:** [2026-11-12-rag-chatbot-plan.md](2026-11-12-rag-chatbot-plan.md)
**Certificate:** Generative AI with Large Language Models (DeepLearning.AI and AWS)
**Decision log:** [decisions.md](decisions.md) (D1–D19). This spec states
*what* gets built; the log records *why*.

---

## 1. Goal

Add a chatbot to [ryebriscoe.github.io](https://ryebriscoe.github.io) that
answers recruiters' questions about Ariya's coursework, projects, and
certifications. Answers use only the site's own content and link to their
sources.

**Success looks like:** a recruiter asks "What has he built with Java?" and
within a few seconds gets a 2–4 sentence answer naming the CST 438 Spring Boot
registration system and the CST 338 JavaFX app, with clickable links to both
course pages. Asked something the site doesn't cover, the bot says so and
points to Ariya's contact details instead of guessing.

### In scope (v1)
- Content export from the Jekyll site (`chatbot-content.json`).
- A RAG backend on a free Hugging Face ZeroGPU Space.
- A floating-bubble chat widget on every page of the site.
- An evaluation harness and a recorded model and prompt selection.

### Out of scope (v1)
- Fine-tuning (D4), databases and vector stores (D10), chat logging and
  analytics (D12), and moving the site off Jekyll (D7).
- Custom domain setup. It's a separate task that doesn't affect this design.

---

## 2. Architecture

```
GitHub Pages (Jekyll)  ── serves pages + widget ──▶  Visitor's browser
  /chatbot-content.json                               floating bubble (chat.js)
          │                                                │      ▲
          │ fetched at startup                    question │      │ streamed answer
          ▼                                                ▼      │ + sources
Hugging Face Space (Gradio, ZeroGPU)
  load content → chunk → embed into NumPy index
  question → retrieve top-k chunks → build prompt → generate on GPU → stream back
```

Three parts, each understandable on its own:

| Part | Lives in | Responsibility | Depends on |
|---|---|---|---|
| Content export | this repo (`chatbot-content.json`) | Turn site content into one JSON document list | Jekyll only |
| RAG backend | new repo `portfolio-chatbot` → HF Space | Index content; answer questions with sources | The content JSON URL |
| Chat widget | this repo (`assets/js/chatbot/chat.js`, CSS) | UI: send questions, stream answers, show sources | The Space's API |

---

## 3. Content export (Jekyll)

A new Liquid template at the repo root, `chatbot-content.json`, with front
matter `layout: null` and `permalink: /chatbot-content.json`. GitHub Pages
rebuilds it on every push (D8).

### Schema

```json
{
  "generated": "2026-11-10T18:00:00Z",
  "documents": [
    {
      "id": "cst-438",
      "type": "course",
      "title": "CST 438 Software Engineering",
      "url": "/courses/cst-438/",
      "status": "completed",
      "term": "Summer 2026, Term B",
      "tech": ["Java", "Spring Boot", "JavaScript", "AWS EC2"],
      "project": "Course registration system",
      "repo": "https://github.com/cst438-team03-org0/cst438-team-03-registrar",
      "text": "Plain-text body of the page"
    }
  ]
}
```

Courses also carry `catalog`, the catalog description from front matter.

### Sources
- **Courses:** every item in `site.courses`.
  - `id`: `cst-<code>`
  - `title`: `CST <code> <title>`
  - `text`: the rendered body converted to plain text
  - Liquid `{% comment %}` TODO blocks are removed by Jekyll at build time,
    so draft reminders never reach the bot.
- **Pages:** the prose of `projects.md` and the home page lives in
  `_includes/projects-body.html` and `_includes/about-body.html`. Both the
  pages and the JSON template render these includes. Each `<h2>` section
  becomes its own `type: "page"` document:
  - `id`: `project-<slug>` or `about-<slug>`
  - `url`: `/projects/` or `/`
- **Certifications:** each entry in `_data/certifications.yml` becomes a
  `type: "certification"` document.
  - `url`: `/certifications/`
  - `text`: `<issuer>. <blurb>`, plus ` Progress: N%.` when set
  - also carries `status` and `tech`
- Text uses blank lines between paragraphs.
- HTML entities (e.g. `&rsquo;`) are left for the backend loader to decode,
  because Liquid can't.
- Missing fields are omitted, not emitted as `null`.

A CI workflow (`.github/workflows/chatbot-content.yml`) builds the site,
runs `scripts/validate_chatbot_content.py` on the output, and uploads it as
an artifact. Apart from the include refactor, this is the only change to
how the site is built.

---

## 4. RAG backend (Hugging Face Space)

### Repository
A new public GitHub repo, `ryebriscoe/portfolio-chatbot`, so recruiters can
read the code (D14). A GitHub Action pushes `main` to the HF Space using an HF
access token stored as a repo secret. HF Spaces are git repos, so this is a
plain push.

```
portfolio-chatbot/
  app.py              Gradio app: defines the `ask` and `warmup` endpoints
  config.yaml         Every tunable setting (table in §4.4)
  rag/
    content.py        Fetch + validate content JSON, retry 3x (D12)
    chunker.py        Documents → chunks
    index.py          Embedding + NumPy cosine search (D10)
    prompt.py         System prompt + context assembly (D11)
    generate.py       Model loading + streamed generation (@spaces.GPU)
  eval/
    questions.yaml    ~30 test questions with expectations (D13)
    run_eval.py       Runs the set, writes a results table
    eval.ipynb        Colab notebook wrapper for GPU runs
  tests/              pytest unit tests (no GPU, no network)
  requirements.txt
  README.md           Includes the Space front-matter block (sdk: gradio)
```

### 4.1 Chunking
- **Summary chunk:** one per document, built from front matter. Example:
  `"CST 438 Software Engineering (completed, Summer 2026 Term B). Project:
  Course registration system. Tech: Java, Spring Boot, JavaScript, AWS EC2."`
  This makes "what tech" and "what status" questions match strongly.
- **Body chunks:** split on paragraph boundaries and merged to about 120–200
  words. Each one is prefixed with its document title, so it stands alone.
- Every chunk keeps `doc_id`, `title`, `url`, `status`, and `type` as metadata.
- Expected total: about 150 chunks.

### 4.2 Index and retrieval
- Embedding model: `BAAI/bge-small-en-v1.5` (384 dimensions). It runs on CPU
  at startup, outside any GPU function.
- Index: a NumPy array of shape `(n_chunks, 384)` with L2-normalized rows, plus
  a parallel Python list of chunk dicts.
- Questions are embedded with the model's query prefix (D15).
- Search: `scores = vectors @ embed(query) + keyword_weight * keyword(query)`.
  The keyword part is an IDF-weighted share of the question's important
  words found in each chunk (D16). Take the top-k by score and drop any
  chunk below `min_score`.
- If no chunk passes `min_score`, the bot sends the fixed "not covered"
  reply without running the model. Refusal answers carry no sources (D17).
- Two generated overview documents (skills, coursework by status) are added
  to the content before chunking (D18).
- `python -m rag.explain "question"` prints this whole step for one question (D19).
- The retrieval query is the new question plus the previous user question,
  if there is one (D11).
- `index.py` exposes one function, `search(query, k) -> list[Chunk]`, so a
  vector store can replace it later without other changes.

### 4.3 Generation
- **Model:** a 7–8B instruct model from the HF Hub, chosen by the evaluation
  (§6). Shortlist 2–3 current, permissively licensed candidates at build time.
- Loaded onto `cuda` at module level, as ZeroGPU requires. Generation runs in
  a `@spaces.GPU(duration=60)` function and streams tokens through a
  `TextIteratorStreamer`.
- **Prompt:** the system prompt exactly as recorded in D11, then the last 2
  chat turns, then the user question. The context block lists each chunk as
  `[title | status]` followed by its text.

### 4.4 Configuration (`config.yaml`)

| Key | Default | Notes |
|---|---|---|
| `content_url` | `https://ryebriscoe.github.io/chatbot-content.json` | |
| `embed_model` | `BAAI/bge-small-en-v1.5` | |
| `gen_model` | chosen by eval | |
| `query_prefix` | `Represent this sentence for searching relevant passages: ` | Added to questions only (D15) |
| `top_k` | 4 | |
| `keyword_weight` | 0.2 | Tuned by eval (D16) |
| `min_score` | 0.5 | Tuned by eval (D17). Below this, the chunk is not used and not shown as a source |
| `history_turns` | 2 | |
| `temperature` | 0.2 | |
| `max_new_tokens` | 250 | |
| `max_question_chars` | 500 | Also enforced in the widget |

### 4.5 API

The widget calls these endpoints through `@gradio/client`.

| Endpoint | Input | Output |
|---|---|---|
| `/ask` | `question: str`, `history: list[[user, bot]]` | Stream of cumulative `{"answer": str, "sources": [], "done": false}` events, then a final `{"answer", "sources": [{"id", "title", "url"}], "done": true}`; errors are a single `{"error": "empty" \| "too long" \| "unavailable", "done": true}`. Cumulative text can't be lost if an event is dropped |
| `/warmup` | none | `{"ready": true}`. Returns as soon as the app is up, with no GPU use |

Sources are the deduplicated documents of the chunks that scored at least
`min_score`, in score order, with a maximum of 3. Course URLs are
site-relative; the widget prefixes the site origin.

**Validation:** a question that is empty or longer than `max_question_chars`
returns an error event without calling the model.

---

## 5. Chat widget (Jekyll site)

### Files
- `assets/js/chatbot/chat.js`: plain JavaScript (D7), loaded as
  `<script type="module">` from `_layouts/default.html`. Module scripts are
  deferred automatically. It imports `@gradio/client` from jsDelivr with a
  pinned version.
- Widget styles appended to `assets/css/main.css`, using the existing custom
  properties (`--bg`, `--surface`, `--accent`, and so on).
- `_config.yml`: a new `chatbot.space` key holding the Space ID, read by the
  layout and passed to `chat.js` as a `data-` attribute.

### Look and behavior (D6, mockup in [mockups/](mockups/chat-ui-a-floating-bubble.html))
- `>_ ask` pill button fixed bottom-right on every page.
- Clicking it opens a 360px panel with the header `>_ ask about ariya`,
  message list, input `$ type a question_`, and a one-line AI disclosure.
- On first open, it shows three suggested questions as chips, e.g. "Java
  experience?", "Computer vision project?", "AI certifications?".
- Answers stream into the panel. Source chips (e.g. `CST 438`) link to the
  page or repo.
- Under 640px wide, the panel goes full-width.

### States (D12)

| State | Shown |
|---|---|
| Opening | `/warmup` is called; if it hasn't answered within 3 s, show "waking up the assistant... first answer can take up to a minute" |
| Waiting for first token | Typing indicator |
| Queue busy | "busy right now", with one automatic retry |
| Error or 60 s timeout | "The assistant is unavailable right now. Reach Ariya at ariyabriscoe@gmail.com or LinkedIn." plus a Retry button |
| Question too long | Send disabled, with a character counter |

### Accessibility
- The bubble is a `<button>` with `aria-expanded`.
- The panel is `role="dialog"`, and focus moves to the input when it opens.
- Esc closes the panel and returns focus to the bubble.
- The message list is `aria-live="polite"`.

### Isolation
If `chat.js` fails to load or throws, nothing else on the page is affected.
All widget code runs inside one module, and failures are caught and logged
to the console.

---

## 6. Evaluation (D13)

### `eval/questions.yaml`

Each entry looks like this:

```yaml
- id: java-experience
  group: answerable        # answerable | unanswerable | status | off_topic
  question: "What has he built with Java?"
  expect_sources: [cst-438, cst-338]
  must_include: ["Spring Boot", "JavaFX"]
  must_not_include: []
```

There are 32 entries: 16 answerable, 6 unanswerable, 5 status, and 5
off-topic or rule-breaking.

### `run_eval.py`
- For each question, it records the retrieved doc IDs, the answer, time to
  first token, and total time.
- It computes:
  - retrieval hit rate (any expected source in the top-k)
  - answer accuracy (all `must_include` present, no `must_not_include`)
  - refusal accuracy (unanswerable and off-topic answers contain the
    "not covered" phrasing or a decline)
  - median latency
- It prints a Markdown results table to paste into `docs/rag-chatbot/eval-results.md`.

**Process:** run each candidate model with the same config in Colab (GPU), then
pick the model that meets the thresholds with the best manual rating. After
that, every prompt or setting change gets a rerun and a new row in `eval-results.md`.

### Launch thresholds
- Retrieval hit rate ≥ 90%
- Unanswerable: 100% with no invented facts
- Off-topic refusal accuracy ≥ 90%

---

## 7. Testing (code correctness)

The evaluation measures answer quality. These tests check that the code works.

### Backend unit tests (`pytest`, CPU, no network)
- **Chunker:** produces one summary chunk per document, keeps body chunks
  within size limits, preserves metadata, and omits missing fields cleanly.
- **Index:** with a fake deterministic embedder, `search` returns chunks in
  score order, respects `k`, and applies `min_score`.
- **Prompt builder:** includes the system prompt verbatim, labels each chunk
  with its title and status, and truncates history to `history_turns`.
- **Content loader:** retries on failure and raises a clear error after 3 attempts.
- **API validation:** rejects empty and over-length questions.

### Content export check
After `bundle exec jekyll build`, a small script validates
`_site/chatbot-content.json`:
- the JSON parses
- there are 18 course documents
- every document has `id`, `url`, and `text`
- no `TODO` text has leaked through

### Widget
- A manual checklist against a locally running Space: open/close, keyboard
  use, streaming, source links, mobile width, and each error state. The
  error states are triggered by pointing `chatbot.space` at a nonexistent Space.

---

## 8. Build milestones

1. **Content export:** `chatbot-content.json` plus its validation script.
2. **RAG core:** chunker, index, prompt builder, and loader, with unit
   tests. Runs locally on CPU with a tiny model for smoke testing.
3. **Eval harness + model selection:** questions file, `run_eval.py`, Colab
   runs, and the first `eval-results.md` entries. Logged as a new decision.
4. **Deploy the Space:** Gradio app on ZeroGPU, with the GitHub → HF sync Action.
5. **Widget:** `chat.js`, CSS, and layout include; manual checklist passes.
6. **Tune and launch:** iterate the prompt and settings until the thresholds
   pass, then enable the widget on the live site.
7. **Write-up:** finalize the decision log, eval results, and presentation material.

---

## 9. Certification deliverables

| Artifact | Location |
|---|---|
| Decision log (D1–D13 and later) | `docs/rag-chatbot/decisions.md` |
| This design spec | `docs/rag-chatbot/2026-11-10-rag-chatbot-design.md` |
| UI mockup | `docs/rag-chatbot/mockups/` |
| Evaluation results, before/after | `docs/rag-chatbot/eval-results.md` |
| Source code | `github.com/ryebriscoe/portfolio-chatbot` |
| Live demo | the site's chat bubble |

**Certificate topics covered:** the LLM project lifecycle (§8), RAG vs.
fine-tuning (D4), model selection (D9, §6), prompt engineering (D11),
evaluation (D13, §6), and deployment (§4).

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| HF changes free ZeroGPU terms (as happened with CPU Basic, D9) | Bot unavailable | The widget fails gracefully (D12). The backend is a standard Gradio app, so it can move to another host |
| Cold starts annoy visitors | Slow first answer | Warm-up on open plus an honest status message (D12) |
| Small model invents facts | Recruiter gets a false claim | Grounding rules (D11), sources from metadata, and the 100% unanswerable threshold (D13) |
| Anonymous ZeroGPU queue priority is low | Slow answers at peak times | Short answers (250 tokens), the busy state, and one retry |
| Content gets out of date | Wrong answers | Content comes from the site itself (D8). The Space reloads on restart |
