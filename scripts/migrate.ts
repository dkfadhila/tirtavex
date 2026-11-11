import "./env";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
});

await sql.unsafe(
  "CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
);

const dir = path.join(process.cwd(), "drizzle");
const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();
for (const file of files) {
  const applied = await sql`SELECT id FROM schema_migrations WHERE id = ${file}`;
  if (applied.length) {
    console.log(`skip ${file}`);
    continue;
  }
  const body = await readFile(path.join(dir, file), "utf8");
  const statements = body
    .split(/;\s*(?:\n|$)/)
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("--"));
  for (const statement of statements) await sql.unsafe(statement);
  await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
  console.log(`applied ${file}`);
}

await sql.end();
console.log("migrations complete");
