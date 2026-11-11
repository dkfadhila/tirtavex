import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { databaseUrl, getSql } from "./db";

let started = false;

/** Apply committed SQL once per server process. Does not seed content. */
export async function ensureSchema() {
  if (started || !databaseUrl()) return;
  const sql = getSql();
  if (!sql) return;
  started = true;
  await sql.unsafe(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const dir = path.join(process.cwd(), "drizzle");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const applied = await sql`SELECT id FROM schema_migrations WHERE id = ${file}`;
    if (applied.length) continue;
    const body = await readFile(path.join(dir, file), "utf8");
    const statements = body
      .split(/;\s*(?:\n|$)/)
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith("--"));
    for (const statement of statements) await sql.unsafe(statement);
    await sql`INSERT INTO schema_migrations (id) VALUES (${file}) ON CONFLICT (id) DO NOTHING`;
  }
}
