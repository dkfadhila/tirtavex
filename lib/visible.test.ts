import assert from "node:assert/strict";
import test from "node:test";
import { visibleText } from "./visible";

test("hides unresolved placeholder fields", () => {
  assert.equal(visibleText("{{city}}, {{country}}"), null);
  assert.equal(visibleText("Based in {{city}}."), null);
  assert.equal(visibleText("{{full_name}}"), null);
});

test("turns named tokens into readable words", () => {
  assert.equal(visibleText("{{neon_bazaar}} launch film"), "Neon Bazaar launch film");
});

test("leaves finished copy alone", () => {
  assert.equal(visibleText("AI video and Web3 stories."), "AI video and Web3 stories.");
});
