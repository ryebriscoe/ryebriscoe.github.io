# My Portfolio Chatbot

I built a chatbot that answers questions about my portfolio. It only uses
what's on my site, and it links to the page each answer came from.

This is my applied project for the **Generative AI with Large Language
Models** certificate (DeepLearning.AI and AWS). It went live on 2026-11-23.

- **Try it:** [ryebriscoe.github.io](https://ryebriscoe.github.io). Click the `>_ ask` bubble in the bottom right.
- **Backend code:** [github.com/ryebriscoe/portfolio-chatbot](https://github.com/ryebriscoe/portfolio-chatbot)
- **Running app:** [huggingface.co/spaces/rye22/ask-about-ariya](https://huggingface.co/spaces/rye22/ask-about-ariya)

## How it works

1. My site saves all its content to one file, `chatbot-content.json`.
2. The backend splits that file into small chunks and turns each one into
   numbers (embeddings).
3. When someone asks a question, it finds the 4 chunks that match best.
4. A language model (`gpt-oss-20b` on Groq) writes a short answer from only
   those chunks.
5. If nothing matches, the bot says so instead of guessing.

## What's in this folder

| File | What it is |
|---|---|
| [decisions.md](decisions.md) | Every choice I made (D1–D28) and why |
| [eval-results.md](eval-results.md) | Test scores before and after each change |
| [model-comparison-answers.md](model-comparison-answers.md) | Four models answering the same 32 questions |
| [evidence/](evidence/) | Raw results from my Colab model test |
| [2026-11-10-rag-chatbot-design.md](2026-11-10-rag-chatbot-design.md) | The design I planned first |
| [2026-11-12-rag-chatbot-plan.md](2026-11-12-rag-chatbot-plan.md) | The build plan, step by step |
| [mockups/](mockups/) | The chat window design |
| [hugging-face-setup.md](hugging-face-setup.md) | My Hugging Face setup checklist |

## My main decisions

- **Planning (D1–D14):** keep my site on GitHub Pages and Jekyll, run the bot
  on a free Hugging Face Space, and tune it with settings instead of training.
- **Search (D15–D19):** mix meaning and keyword matching, and give a fixed
  "not covered" reply when nothing matches.
- **Model (D20–D24):** I tested models on Colab Pro, then moved to Groq so
  visitors never hit a GPU limit. `gpt-oss-20b` scored best.
- **Launch (D25–D28):** better source links, hourly content refresh, and
  question limits per visitor.

## Where the chatbot files are

| Path | What it does |
|---|---|
| `chatbot-content.json` | Saves the site content for the bot |
| `_includes/chatbot/` | The chat bubble and the text cleanup |
| `assets/js/chatbot/` | The chat window code |
| `assets/css/main.css` | Chat styles (the `chatbot` section at the end) |
| `scripts/validate_chatbot_content.py` | Checks the content file after each build |
| `tests/chatbot/` | Tests |
| `.github/workflows/chatbot-content.yml` | Builds the site and runs the tests |

## Turn it on or off

In `_config.yml`, set `chatbot: enabled:` to `true` or `false`.
