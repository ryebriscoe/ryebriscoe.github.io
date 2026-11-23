import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_QUESTION_CHARS,
  SUGGESTIONS,
  appendTurn,
  chipLabel,
  sourceHref,
  splitOnLinkedIn,
  statusMessage,
  validateQuestion,
} from "../../../assets/js/chatbot/chat-core.js";

const ORIGIN = "https://ryebriscoe.github.io";

test("validateQuestion trims", () => {
  assert.deepEqual(validateQuestion("  hi  "), { ok: true, value: "hi" });
});

test("validateQuestion rejects whitespace-only and non-strings as empty", () => {
  for (const bad of ["   \n", "", null, undefined, 42, ["q"]]) {
    assert.deepEqual(validateQuestion(bad), { ok: false, error: "empty" });
  }
});

test("validateQuestion length limit is 500 after trimming", () => {
  assert.equal(MAX_QUESTION_CHARS, 500);
  assert.deepEqual(validateQuestion("  " + "a".repeat(500) + "  "), { ok: true, value: "a".repeat(500) });
  assert.deepEqual(validateQuestion("a".repeat(501)), { ok: false, error: "too long" });
});

test("sourceHref prefixes site-relative paths", () => {
  assert.equal(sourceHref("/courses/cst-438/", ORIGIN), "https://ryebriscoe.github.io/courses/cst-438/");
  assert.equal(sourceHref("/courses/cst-438/", ORIGIN + "/"), "https://ryebriscoe.github.io/courses/cst-438/");
});

test("sourceHref keeps absolute http(s) URLs", () => {
  assert.equal(sourceHref("https://github.com/x", ORIGIN), "https://github.com/x");
  assert.equal(sourceHref("http://example.com/a", ORIGIN), "http://example.com/a");
});

test("sourceHref neutralizes other schemes and bare paths", () => {
  for (const bad of ["javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x", "courses/x", "//evil.com/x", "", null]) {
    assert.equal(sourceHref(bad, ORIGIN), "#", String(bad));
  }
});

test("appendTurn returns a new capped history", () => {
  const h = [["q1", "a1"], ["q2", "a2"]];
  const out = appendTurn(h, "q3", "a3");
  assert.deepEqual(out, [["q2", "a2"], ["q3", "a3"]]);
  assert.deepEqual(h, [["q1", "a1"], ["q2", "a2"]]);
});

test("statusMessage uses the exact copy", () => {
  assert.equal(statusMessage("waking", "a@b.c"), "waking up the assistant... first answer can take up to a minute");
  assert.equal(statusMessage("busy", "a@b.c"), "busy right now");
  assert.equal(
    statusMessage("unavailable", "a@b.c"),
    "The assistant is unavailable right now. Reach Ariya at a@b.c or LinkedIn.",
  );
  assert.equal(
    statusMessage("quota", "a@b.c"),
    "You've reached today's free limit for the assistant. Try again later, or reach Ariya at a@b.c or LinkedIn.",
  );
});

test("chipLabel shortens course titles and keeps others", () => {
  assert.equal(chipLabel("CST 438 Software Engineering"), "CST 438");
  assert.equal(chipLabel("CST 462S Race, Gender, Class in the Digital World"), "CST 462S");
  assert.equal(chipLabel("B.A.D. — basketball action detection"), "B.A.D. — basketball action detection");
  assert.equal(chipLabel(""), "source");
});

test("suggestions pair a short label with a full question", () => {
  assert.deepEqual(SUGGESTIONS, [
    { label: "Java experience?", question: "What has he built with Java?" },
    { label: "Computer vision project?", question: "Tell me about his computer vision project." },
    { label: "AI certifications?", question: "What AI certifications is he working on?" },
  ]);
});

test("splitOnLinkedIn splits the message around the word so it can become the link", () => {
  assert.deepEqual(
    splitOnLinkedIn("The assistant is unavailable right now. Reach Ariya at a@b.c or LinkedIn."),
    ["The assistant is unavailable right now. Reach Ariya at a@b.c or ", "."],
  );
  assert.equal(splitOnLinkedIn("busy right now"), null);
});
