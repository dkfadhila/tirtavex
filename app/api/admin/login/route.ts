import { NextResponse } from "next/server";
import { json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { secretEqual } from "@/lib/secret-equal";
import { sessionCookieName, sessionMaxAge, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const allowed = await rateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000).catch(() => true);
  if (!allowed) return json({ error: "Too many attempts. Wait a few minutes." }, 429);
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret || secret.length < 16) {
    return json({ error: "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." }, 503);
  }
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const given = typeof body?.password === "string" ? body.password : "";
  if (!given || !secretEqual(given, password)) return json({ error: "Wrong password." }, 401);
  const token = await signSession(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge(),
  });
  return response;
}
