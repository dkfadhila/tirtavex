import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  sql?: Sql;
  db?: PostgresJsDatabase<typeof schema>;
};

function isLocal(url: string) {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

export function getSql(): Sql | null {
  const url = databaseUrl();
  if (!url) return null;
  if (!globalForDb.sql) {
    globalForDb.sql = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 8,
      prepare: false,
      ssl: isLocal(url) ? false : "require",
    });
  }
  return globalForDb.sql;
}

export function getDb() {
  const sql = getSql();
  if (!sql) return null;
  if (!globalForDb.db) globalForDb.db = drizzle(sql, { schema });
  return globalForDb.db;
}

export async function closeDb() {
  if (globalForDb.sql) {
    await globalForDb.sql.end({ timeout: 5 });
    globalForDb.sql = undefined;
    globalForDb.db = undefined;
  }
}
