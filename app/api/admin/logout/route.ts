import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
