import assert from "node:assert/strict";
import test from "node:test";
import { normalizePathname } from "../proxy";

test("decodes a single-encoded path and rejects malformed ones", () => {
  assert.equal(normalizePathname("/about"), "/about");
  assert.equal(normalizePathname("/%61bout"), "/about");
  assert.equal(normalizePathname("/%61dmin"), "/admin");
  assert.equal(normalizePathname("/%"), null);
});
