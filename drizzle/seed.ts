import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import { users } from "./schema";

const DEMO_USERS = [
  {
    email: "admin@studyhub.dev",
    name: "Admin",
    password: "admin123",
    role: "admin",
  },
  {
    email: "user@studyhub.dev",
    name: "Demo User",
    password: "user123",
    role: "user",
  },
];

function requireSeedConfirmation() {
  if (process.env.ALLOW_DEMO_SEED === "true") {
    return;
  }

  console.error("Refusing to seed without ALLOW_DEMO_SEED=true.");
  console.error("This protects real/demo databases from accidental writes.");
  console.error("For a non-production database, run:");
  console.error("  $env:ALLOW_DEMO_SEED='true'; npm run db:seed");
  process.exit(1);
}

async function seed() {
  requireSeedConfirmation();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("Seeding demo users...");

  for (const demoUser of DEMO_USERS) {
    const passwordHash = hashSync(demoUser.password, 10);

    await db
      .insert(users)
      .values({
        email: demoUser.email,
        name: demoUser.name,
        passwordHash,
        role: demoUser.role,
        blocked: false,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: demoUser.name,
          passwordHash,
          role: demoUser.role,
          blocked: false,
        },
      });
  }

  console.log("Seed complete: admin@studyhub.dev / admin123, user@studyhub.dev / user123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
