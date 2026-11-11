import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { HttpError } from "./repository";
import { secretEqual } from "./secret-equal";
import { verifySession } from "./session";

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, { status, headers });
}

export async function run(task: () => Promise<unknown>, headers?: HeadersInit) {
  try {
    return json(await task(), 200, headers);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("[api]", error instanceof Error ? error.message : error);
    return json({ error: "Something went wrong" }, 500);
  }
}

export function rejectBadOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    if (!host || new URL(origin).host !== host) return json({ error: "Forbidden" }, 403);
  } catch {
    return json({ error: "Forbidden" }, 403);
  }
  return null;
}

export function rejectUnlessJson(request: Request) {
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("application/json")) return json({ error: "Unsupported media type" }, 415);
  return null;
}

export async function requireAdmin(request?: Request) {
  if (request) {
    const origin = rejectBadOrigin(request);
    if (origin) return origin;
  }
  const secret = process.env.ADMIN_SESSION_SECRET;
  const jar = await cookies();
  const token = jar.get("tvx_session")?.value;
  if (!secret || secret.length < 16 || !(await verifySession(token, secret))) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function requireBearer(request: Request, envName: "AGENT_API_KEY" | "CRON_SECRET") {
  const expected = process.env[envName];
  if (!expected) {
    console.error(`[api] ${envName} is not configured`);
    return json({ error: "Unavailable" }, 503);
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || token === "undefined" || token === "null" || !secretEqual(token, expected)) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export const publicCache = { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" };
