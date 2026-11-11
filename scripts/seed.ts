import "./env";
import { closeDb } from "../lib/db";
import { replaceWithSeed } from "../lib/repository";

await replaceWithSeed();
console.log("seeded placeholder content");
await closeDb();
