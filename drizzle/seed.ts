import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import { users } from "./schema";

const DEMO_USERS = [
  {
    email: process.env.DEMO_ADMIN_EMAIL ?? "demo-admin@example.local",
    name: process.env.DEMO_ADMIN_NAME ?? "Demo Admin",
    password: process.env.DEMO_ADMIN_PASSWORD ?? "ChangeMe123!",
    role: "admin",
  },
  {
    email: process.env.DEMO_USER_EMAIL ?? "demo-user@example.local",
    name: process.env.DEMO_USER_NAME ?? "Demo User",
    password: process.env.DEMO_USER_PASSWORD ?? "ChangeMe123!",
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

  console.log("Seed complete. Demo emails:");
  for (const demoUser of DEMO_USERS) {
    console.log(`- ${demoUser.role}: ${demoUser.email}`);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
