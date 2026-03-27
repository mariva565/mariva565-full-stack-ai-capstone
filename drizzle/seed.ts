import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import { users } from "./schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding demo users...");

  await db.insert(users).values([
    {
      email: "admin@studyhub.dev",
      name: "Admin",
      passwordHash: hashSync("admin123", 10),
      role: "admin",
    },
    {
      email: "user@studyhub.dev",
      name: "Demo User",
      passwordHash: hashSync("user123", 10),
      role: "user",
    },
  ]);

  console.log("Seed complete: admin@studyhub.dev / admin123, user@studyhub.dev / user123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
