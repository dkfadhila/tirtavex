import { eventsSince } from "@/lib/content";
import { databaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
  let last = Number(request.headers.get("last-event-id") || "0") || 0;
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  const started = Date.now();

  const stream = new ReadableStream({
    start(controller) {
      const tick = async () => {
        if (Date.now() - started > 45_000) {
          stop();
          controller.close();
          return;
        }
        try {
          if (databaseUrl()) {
            const rows = await eventsSince(last);
            for (const row of rows) {
              last = row.id;
              controller.enqueue(encoder.encode(`id: ${row.id}\nevent: ${row.type}\ndata: ${JSON.stringify(row.payload)}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          stop();
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      };
      timer = setInterval(() => void tick(), 2000);
      void tick();
    },
    cancel() {
      stop();
    },
  });

  function stop() {
    if (timer) clearInterval(timer);
    timer = undefined;
  }

  return new Response(stream, { headers });
}
