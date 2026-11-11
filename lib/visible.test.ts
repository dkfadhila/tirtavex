import assert from "node:assert/strict";
import test from "node:test";
import { visibleText } from "./visible";

test("hides any string that still has a token", () => {
  assert.equal(visibleText("{{city}}, {{country}}"), null);
  assert.equal(visibleText("Based in {{city}}."), null);
  assert.equal(visibleText("{{neon_bazaar}} launch film"), null);
  assert.equal(visibleText("Launch film for {{protocol}}"), null);
});

test("leaves finished copy alone", () => {
  assert.equal(visibleText("AI video and Web3 stories."), "AI video and Web3 stories.");
});
