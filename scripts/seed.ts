import "./env";
import { closeDb } from "../lib/db";
import { replaceWithSeed } from "../lib/repository";

async function main() {
  await replaceWithSeed();
  console.log("seeded placeholder content");
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb().catch(() => undefined);
  process.exit(1);
});
