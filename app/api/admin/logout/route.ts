import { NextResponse } from "next/server";
import { rejectBadOrigin } from "@/lib/api";
import { sessionCookieName } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = rejectBadOrigin(request);
  if (origin) return origin;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
