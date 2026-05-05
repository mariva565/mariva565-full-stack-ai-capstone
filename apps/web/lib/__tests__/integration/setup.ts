import * as path from "path";
import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

import * as schema from "../../../../../drizzle/schema";

const appRoot = path.resolve(__dirname, "../../..");

dotenv.config({ path: path.join(appRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(appRoot, ".env.local"), override: true, quiet: true });

const TEST_DB_URL = process.env.TEST_DATABASE_URL;

if (!TEST_DB_URL) {
  throw new Error("TEST_DATABASE_URL is required for integration tests");
}

const client = neon(TEST_DB_URL);

export const testDb = drizzle(client, { schema });

export async function cleanTestDb() {
  await testDb.execute(sql`
    TRUNCATE TABLE
      comments,
      post_likes,
      post_bookmarks,
      posts,
      shared_materials,
      ai_tool_outputs,
      materials,
      modules,
      course_members,
      courses,
      conversation_members,
      messages,
      conversations,
      favorites,
      events,
      milestones,
      activity_logs,
      user_push_tokens,
      oauth_accounts,
      password_reset_tokens,
      users
    RESTART IDENTITY CASCADE
  `);
}
