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

// Split into individual statements (Neon serverless doesn't support multi-statement queries)
// Strip line comments first, then split by semicolon
const stripped = query.replace(/--[^\n]*/g, "");
const statements = stripped
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

try {
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log("✓ Migration applied successfully.");
} catch (err) {
  if (err.message?.includes("already exists")) {
    console.log("ℹ Table already exists — skipping.");
  } else {
    console.error("✗ Migration failed:", err.message);
    process.exit(1);
  }
}
