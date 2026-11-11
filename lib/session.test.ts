import assert from "node:assert/strict";
import test from "node:test";
import { signSession, verifySession } from "./session";

const secret = "test-session-secret-32chars-min";

test("rejects a short secret, a missing token, and a tampered token", async () => {
  assert.equal(await verifySession("abc", "too-short"), false);
  assert.equal(await verifySession(undefined, secret), false);
  const token = await signSession(secret);
  assert.equal(await verifySession(token, secret), true);
  assert.equal(await verifySession(`${token}x`, secret), false);
  const [payload] = token.split(".");
  assert.equal(await verifySession(`${payload}.aaaa`, secret), false);
});

test("rejects an expired session", async () => {
  const token = await signSession(secret, Date.now() - 2 * 24 * 60 * 60 * 1000);
  assert.equal(await verifySession(token, secret), false);
});
