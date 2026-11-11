import { eventsSince } from "@/lib/content";
import { databaseUrl } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(request: Request) {
  const allowed = await rateLimit(`stream:${clientIp(request)}`, 30, 60_000).catch(() => false);
  if (!allowed) return new Response("retry: 60000\n\n", { status: 429, headers: { "Content-Type": "text/event-stream" } });
  let body = "retry: 60000\n\n";
  if (databaseUrl()) {
    const last = Number(request.headers.get("last-event-id") || "0") || 0;
    try {
      const rows = await eventsSince(last);
      for (const row of rows.slice(0, 20)) {
        body += `id: ${row.id}\nevent: ${row.type}\ndata: ${JSON.stringify(row.payload)}\n\n`;
      }
    } catch (error) {
      console.error("[stream]", error instanceof Error ? error.message : error);
    }
  }
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
