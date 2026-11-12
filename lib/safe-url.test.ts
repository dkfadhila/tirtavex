import assert from "node:assert/strict";
import test from "node:test";
import { isExampleHost, isPlaceholderEmail, isPlaceholderStatusUrl, safeHttpUrl, safeMediaUrl, safeXUrl } from "./safe-url";

test("allows only http(s) links and x.com posts", () => {
  assert.equal(safeHttpUrl("javascript:alert(1)"), null);
  assert.equal(safeHttpUrl("https://example.com/press"), "https://example.com/press");
  assert.equal(safeMediaUrl("/media/partners/az8.png"), "/media/partners/az8.png");
  assert.equal(safeMediaUrl("//evil.com/x.png"), null);
  assert.equal(safeMediaUrl("/../etc/passwd"), null);
  assert.equal(safeXUrl("https://twitter.com/TirtaVEX/status/20"), "https://x.com/TirtaVEX/status/20");
  assert.equal(safeXUrl("https://evil.com/status/20"), null);
});

test("flags placeholder hosts, emails, and status ids", () => {
  assert.equal(isExampleHost("https://example.com/press"), true);
  assert.equal(isExampleHost("https://x.com/TirtaVEX"), false);
  assert.equal(isPlaceholderEmail("hello@example.com"), true);
  assert.equal(isPlaceholderEmail("hello@tirtavex.com"), false);
  assert.equal(isPlaceholderStatusUrl("https://x.com/TirtaVEX/status/1000000000000000001"), true);
  assert.equal(isPlaceholderStatusUrl("https://x.com/TirtaVEX/status/20"), false);
});
