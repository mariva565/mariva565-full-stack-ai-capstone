import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function run() {
  const sql = neon(process.env.DATABASE_URL!);
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  console.log("Tables in Neon DB:");
  tables.forEach((t) => console.log(`  - ${t.tablename}`));
  console.log(`\nTotal: ${tables.length} tables`);
}

run();
