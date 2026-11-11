import assert from "node:assert/strict";
import test from "node:test";
import { requireBearer } from "./api";

test("bearer auth fails closed", async () => {
  const previous = process.env.AGENT_API_KEY;
  delete process.env.AGENT_API_KEY;
  const missing = requireBearer(new Request("https://tirtavex.vercel.app/api/agent/heartbeat"), "AGENT_API_KEY");
  assert.equal(missing?.status, 503);
  assert.equal((await missing!.json()).error, "Unavailable");

  process.env.AGENT_API_KEY = "agent-secret-value";
  for (const header of [undefined, "Bearer", "Bearer ", "Bearer undefined", "Bearer null", "bearer agent-secret-value", "Bearer wrong"]) {
    const request = new Request("https://tirtavex.vercel.app/api/agent/heartbeat", {
      headers: header ? { authorization: header } : {},
    });
    const response = requireBearer(request, "AGENT_API_KEY");
    assert.equal(response?.status, 401, header ?? "no header");
  }
  const ok = requireBearer(
    new Request("https://tirtavex.vercel.app/api/agent/heartbeat", { headers: { authorization: "Bearer agent-secret-value" } }),
    "AGENT_API_KEY",
  );
  assert.equal(ok, null);
  if (previous === undefined) delete process.env.AGENT_API_KEY;
  else process.env.AGENT_API_KEY = previous;
});
