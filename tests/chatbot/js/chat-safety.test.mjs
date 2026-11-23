import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const CHAT_JS = new URL("../../../assets/js/chatbot/chat.js", import.meta.url);

// Model and user text must only ever be rendered with textContent.
test("chat.js never uses innerHTML", { skip: !existsSync(CHAT_JS) && "chat.js not written yet (Task A3)" }, () => {
  const src = readFileSync(CHAT_JS, "utf8");
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(src));
});
