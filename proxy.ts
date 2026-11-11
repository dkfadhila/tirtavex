import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

export function normalizePathname(pathname: string): string | null {
  if (!pathname.includes("%")) return pathname;
  try {
    const decoded = decodeURIComponent(pathname);
    if (!decoded.startsWith("/") || decoded.includes("\0") || decoded.includes("\\") || decoded.startsWith("//")) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const normalized = normalizePathname(request.nextUrl.pathname);
  if (!normalized) return NextResponse.redirect(new URL("/", request.url));
  if (normalized !== request.nextUrl.pathname) {
    const url = request.nextUrl.clone();
    url.pathname = normalized;
    return NextResponse.redirect(url);
  }
  const pathname = normalized;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  const token = request.cookies.get("tvx_session")?.value;
  const ok = await verifySession(token, process.env.ADMIN_SESSION_SECRET);
  const isLogin = pathname === "/admin/login";
  if (!ok && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (ok && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:webp|png|jpg|jpeg|svg|ico|txt)$).*)"],
};
