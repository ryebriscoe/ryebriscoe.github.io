# Portfolio RAG Chatbot: start here

A retrieval-augmented chatbot that answers recruiters' questions about my
coursework, projects, and certifications using only my portfolio's own
content, and links to where each answer came from. Built as the applied
project for the **Generative AI with Large Language Models** certificate
(DeepLearning.AI and AWS). Live since 2026-11-23.

| | |
|---|---|
| **Try it** | [ryebriscoe.github.io](https://ryebriscoe.github.io): the `>_ ask` bubble, bottom right |
| **Backend code** | [github.com/ryebriscoe/portfolio-chatbot](https://github.com/ryebriscoe/portfolio-chatbot) |
| **Running service** | [huggingface.co/spaces/rye22/ask-about-ariya](https://huggingface.co/spaces/rye22/ask-about-ariya) |

## How it works

1. **Content.** Every time the site deploys, Jekyll publishes all course,
   project, and certification content as one file, `/chatbot-content.json`.
2. **Search.** The backend on Hugging Face splits that content into about 60
   chunks and embeds them (`bge-small-en-v1.5`). Each question is scored
   against every chunk: `meaning + 0.2 × keyword match`. It reloads the
   content every hour.
3. **Answer.** The top 4 chunks and six grounding rules go to an open model
   (`gpt-oss-20b`, served by Groq), which writes a 2–4 sentence answer.
   If nothing matches, the bot says so without calling the model.
4. **Sources.** The links under each answer are the retrieved pages that
   best match what the answer actually says.

## What's in this folder

| File | What it is | Use it for |
|---|---|---|
| [decisions.md](decisions.md) | Every design decision (D1–D28) with context, options, choice, and evidence; also the final code review | The story of the project, and why each choice was made |
| [eval-results.md](eval-results.md) | Every evaluation run, before and after each change | The numbers |
| [model-comparison-answers.md](model-comparison-answers.md) | Four models' answers to the same 32 questions, side by side | Showing how the model was chosen |
| [evidence/](evidence/) | Raw Colab comparison output (results JSON, rating sheet) | Backing up the comparison |
| [2026-11-10-rag-chatbot-design.md](2026-11-10-rag-chatbot-design.md) | The design spec approved before building | What was planned |
| [2026-11-12-rag-chatbot-plan.md](2026-11-12-rag-chatbot-plan.md) | The step-by-step build plan | How it was built, task by task |
| [mockups/](mockups/) | The chosen chat UI mockup | The look (D6) |
| [hugging-face-setup.md](hugging-face-setup.md) | Phone-friendly checklist for the Hugging Face setup | Reference |

## The decisions in order

**Planning**
- D1: Keep the site on GitHub Pages; the chatbot backend lives elsewhere
- D2: Primary audience is recruiters and employers
- D3: Self-host an open model on a free Hugging Face Space
- D4: Tune through configuration (prompt, retrieval, parameters), not fine-tuning
- D5: Submitted for the Generative AI with LLMs certificate
- D6: Floating chat bubble with a terminal-styled panel
- D7: Keep the site on Jekyll; the widget is plain JavaScript
- D8: Jekyll generates the content file the bot indexes
- D9: Free ZeroGPU hardware instead of CPU Basic
- D10: In-memory NumPy index, no database
- D11: Grounded system prompt with six rules
- D12: The site always works, even when the bot doesn't
- D13: A fixed test set with launch thresholds decides the model and prompt
- D14: Backend in its own public repo, synced to the Space

**Tuning retrieval**
- D15: Query prefix for the embedding model
- D16: Hybrid search: meaning plus a keyword bonus
- D17: Fixed "not covered" reply when nothing matches
- D18: Overview documents for big-picture questions
- D19: Explain tool and reading guide

**Choosing and hosting the model**
- D20: Qwen3-4B-Instruct-2507 for self-hosting (Colab comparison)
- D21: ZeroGPU deployment fixes (ONNX embeddings, GPU only for generation)
- D22: Run the comparison on Colab Pro
- D23: Switch to Groq so visitors never hit a GPU limit
- D24: gpt-oss-20b on Groq (Groq comparison)

**Launch and after**
- D25: Launch after a 9-point widget checklist
- D26: Better source links
- D27: Hourly content refresh
- D28: Per-visitor question limits

## Where the code lives

**Backend** (separate repo): `rag/` is the pipeline, one step per file;
`eval/` is the 32-question test set and runner; `config.yaml` holds every
setting. Its README lists the files in the order a question flows through them.

**In this portfolio repo:**

| Path | What it does |
|---|---|
| `chatbot-content.json` | Jekyll template that publishes the site content for the bot |
| `_includes/chatbot/widget.html` | Adds the chat bubble to every page (when `chatbot.enabled` is true in `_config.yml`) |
| `_includes/chatbot/text.html` | Turns page HTML into plain text for the content file |
| `_includes/about-body.html`, `_includes/projects-body.html` | Home and projects page prose, shared by the pages and the content file |
| `assets/js/chatbot/` | The chat widget (`chat.js`) and its tested logic (`chat-core.js`) |
| `assets/css/main.css` | Widget styles, in the `chatbot` section at the end |
| `scripts/validate_chatbot_content.py` | Checks the content file after every build |
| `tests/chatbot/` | Tests for the validator and the widget |
| `.github/workflows/chatbot-content.yml` | CI: builds the site, runs the tests, validates the content file |
| `_config.preview.yml` | Preview build with the bubble on, for local testing |
