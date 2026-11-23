// Floating chat widget for the portfolio RAG bot (spec §5, decisions D6, D12).
// All model and user text is rendered with textContent, never as HTML.

import {
  MAX_QUESTION_CHARS,
  SUGGESTIONS,
  appendTurn,
  chipLabel,
  sourceHref,
  splitOnLinkedIn,
  statusMessage,
  validateQuestion,
} from "./chat-core.js";

const CLIENT_URL = "https://cdn.jsdelivr.net/npm/@gradio/client@2.7.2/dist/index.min.js";
const TIMEOUT_MS = 60000;
const WAKE_NOTICE_MS = 3000;
const DISCLOSURE = "Answers are AI-generated from this site's content and may contain mistakes.";

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "text") node.textContent = value;
    else if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

function failure(kind, message = kind) {
  return Object.assign(new Error(message), { kind });
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(failure("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function start(root) {
  const { space, origin, email, linkedin } = root.dataset;
  let client = null;
  let connecting = null;
  let history = [];
  let busy = false;

  const bubble = el("button", {
    class: "chat-bubble", type: "button", text: ">_ ask",
    "aria-expanded": "false", "aria-controls": "chat-panel",
  });
  const closeButton = el("button", { class: "chat-close", type: "button", text: "x", "aria-label": "Close chat" });
  const log = el("div", { class: "chat-log", "aria-live": "polite" });
  const suggestions = el("div", { class: "chat-suggestions" },
    SUGGESTIONS.map((s) => el("button", { class: "chat-chip", type: "button", text: s.label, onclick: () => ask(s.question) })));
  const status = el("div", { class: "chat-status", role: "status" });
  const input = el("input", {
    class: "chat-input", type: "text", placeholder: "$ type a question_",
    "aria-label": "Your question", autocomplete: "off",
  });
  const send = el("button", { class: "chat-send", type: "submit", text: "send" });
  const counter = el("span", { class: "chat-counter" });
  const form = el("form", { class: "chat-form" }, [input, send]);
  const panel = el("div", { class: "chat-panel", id: "chat-panel", role: "dialog", "aria-label": "Ask about Ariya" }, [
    el("div", { class: "chat-top" }, [el("span", { text: ">_ ask about ariya" }), closeButton]),
    log, suggestions, status, form,
    el("div", { class: "chat-foot" }, [el("span", { class: "chat-disclosure", text: DISCLOSURE }), counter]),
  ]);
  panel.hidden = true;
  root.append(panel, bubble);

  function refreshControls() {
    const length = input.value.trim().length;
    counter.textContent = `${length}/${MAX_QUESTION_CHARS}`;
    counter.classList.toggle("is-over", length > MAX_QUESTION_CHARS);
    send.disabled = busy || !validateQuestion(input.value).ok;
  }

  function setStatus(kind, retryQuestion) {
    status.replaceChildren();
    if (!kind) return;
    const message = statusMessage(kind, email);
    const parts = linkedin ? splitOnLinkedIn(message) : null;
    if (parts) {  // the word "LinkedIn" in the sentence becomes the link
      status.append(el("span", {}, [
        parts[0],
        el("a", { href: linkedin, text: "LinkedIn", rel: "noopener", target: "_blank" }),
        parts[1],
      ]));
    } else {
      status.append(el("span", { text: message }));
    }
    if (kind === "unavailable" || kind === "quota") {
      if (retryQuestion) {
        status.append(" ", el("button", {
          class: "chat-retry", type: "button", text: "retry",
          onclick: () => { setStatus(null); ask(retryQuestion, true); },
        }));
      }
    }
  }

  function connect() {
    if (client) return Promise.resolve(client);
    if (!connecting) {
      const wakeNotice = setTimeout(() => setStatus("waking"), WAKE_NOTICE_MS);
      connecting = (async () => {
        const { Client } = await import(CLIENT_URL);
        const app = await Client.connect(space);
        const warm = await app.predict("/warmup", []);
        if (!warm?.data?.[0]?.ready) throw failure("unavailable");
        client = app;
        return app;
      })()
        .finally(() => { clearTimeout(wakeNotice); })
        .then((app) => { setStatus(null); return app; })
        .catch((err) => { connecting = null; throw err; });
    }
    return connecting;
  }

  async function streamAnswer(app, question, answerEl) {
    const job = app.submit("/ask", [question, history]);
    for await (const msg of job) {
      if (msg.type === "status") {
        if (msg.stage === "pending" && msg.position > 0) setStatus("busy");
        if (msg.stage === "error") throw failure(/quota/i.test(msg.message || "") ? "quota" : "error", msg.message);
      } else if (msg.type === "data") {
        const event = msg.data?.[0] || {};
        if (event.error) {
          // rate_limited: this visitor hit the per-visitor limit (D28); busy: the model API is rate-limited
          const kind = { unavailable: "unavailable", rate_limited: "quota" }[event.error] || "error";
          throw failure(kind, event.error);
        }
        setStatus(null);
        if (event.answer) answerEl.textContent = event.answer;
        if (event.done) return event;
      }
    }
    throw failure("error", "stream ended without an answer");
  }

  function renderSources(sources) {
    if (!sources?.length) return;
    log.append(el("p", { class: "chat-sources" }, sources.map((s) =>
      el("a", { class: "chat-chip", href: sourceHref(s.url, origin), text: chipLabel(s.title) }))));
  }

  async function ask(text, isRetry = false) {
    const check = validateQuestion(text);
    if (!check.ok || busy) return;
    busy = true;
    suggestions.hidden = true;
    if (!isRetry) {
      log.append(el("p", { class: "chat-q", text: `> ${check.value}` }));
      input.value = "";
    }
    refreshControls();
    const answerEl = el("p", { class: "chat-a" }, [el("span", { class: "chat-typing", text: "...", "aria-label": "thinking" })]);
    log.append(answerEl);
    log.scrollTop = log.scrollHeight;
    try {
      const app = await withTimeout(connect(), TIMEOUT_MS);
      const final = await withTimeout(streamAnswer(app, check.value, answerEl), TIMEOUT_MS);
      answerEl.textContent = final.answer;
      renderSources(final.sources);
      history = appendTurn(history, check.value, final.answer);
    } catch (err) {
      answerEl.remove();
      const terminal = err.kind === "quota" || err.kind === "unavailable";
      if (!isRetry && !terminal) {
        busy = false;
        return await ask(check.value, true); // one automatic retry (D12)
      }
      console.error("chatbot:", err);
      setStatus(err.kind === "quota" ? "quota" : "unavailable", check.value);
    } finally {
      busy = false;
      refreshControls();
      log.scrollTop = log.scrollHeight;
    }
  }

  function open() {
    panel.hidden = false;
    bubble.setAttribute("aria-expanded", "true");
    input.focus();
    connect().catch((err) => {
      console.error("chatbot:", err);
      setStatus("unavailable");
    });
  }

  function close() {
    panel.hidden = true;
    bubble.setAttribute("aria-expanded", "false");
    bubble.focus();
  }

  bubble.addEventListener("click", () => (panel.hidden ? open() : close()));
  closeButton.addEventListener("click", close);
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  input.addEventListener("input", refreshControls);
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  refreshControls();
}

try {
  const root = document.getElementById("chatbot");
  if (root?.dataset.space) start(root);
} catch (err) {
  console.error("chatbot:", err);
}
