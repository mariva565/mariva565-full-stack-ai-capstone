import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function check() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, email, name, role FROM users`;
  console.log("DB connection OK. Users:");
  console.log(rows);
}

check();
