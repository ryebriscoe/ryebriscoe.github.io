// Pure logic for the portfolio chat widget (no DOM). Tested with node --test.

export const MAX_QUESTION_CHARS = 500;
export const HISTORY_TURNS = 2;

export const SUGGESTIONS = [
  { label: "Java experience?", question: "What has he built with Java?" },
  { label: "Computer vision project?", question: "Tell me about his computer vision project." },
  { label: "AI certifications?", question: "What AI certifications is he working on?" },
];

export function validateQuestion(text, maxChars = MAX_QUESTION_CHARS) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "empty" };
  const value = text.trim();
  if (value.length > maxChars) return { ok: false, error: "too long" };
  return { ok: true, value };
}

// Only http(s) links and site-relative paths become real links; anything
// else (javascript:, data:, protocol-relative, bare paths) becomes "#".
export function sourceHref(url, siteOrigin) {
  if (typeof url !== "string") return "#";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return siteOrigin.replace(/\/+$/, "") + url;
  return "#";
}

// "CST 438 Software Engineering" -> "CST 438"; other titles stay as they are.
export function chipLabel(title) {
  if (typeof title !== "string" || !title.trim()) return "source";
  const course = title.match(/^CST \d+[A-Za-z]?\b/);
  return course ? course[0] : title.trim();
}

export function appendTurn(history, question, answer, maxTurns = HISTORY_TURNS) {
  return [...history, [question, answer]].slice(-maxTurns);
}

export function statusMessage(kind, email) {
  switch (kind) {
    case "waking":
      return "waking up the assistant... first answer can take up to a minute";
    case "busy":
      return "busy right now";
    case "quota":
      return `You've reached today's free limit for the assistant. Try again later, or reach Ariya at ${email} or LinkedIn.`;
    default:
      return `The assistant is unavailable right now. Reach Ariya at ${email} or LinkedIn.`;
  }
}
