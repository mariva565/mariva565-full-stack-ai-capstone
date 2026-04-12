// One-time migration runner — uses the same Neon connection as the app
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL);

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql>");
  process.exit(1);
}

const query = readFileSync(resolve(__dirname, "..", migrationFile), "utf8");

console.log("Running migration:", migrationFile);
console.log("SQL:\n", query);

try {
  await sql.query(query);
  console.log("✓ Migration applied successfully.");
} catch (err) {
  if (err.message?.includes("already exists")) {
    console.log("ℹ Table already exists — skipping.");
  } else {
    console.error("✗ Migration failed:", err.message);
    process.exit(1);
  }
}
