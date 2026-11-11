export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureSchema } = await import("./lib/ensure-schema");
  await ensureSchema().catch((error: unknown) => {
    console.error("[db] schema check failed", error instanceof Error ? error.message : error);
  });
}
