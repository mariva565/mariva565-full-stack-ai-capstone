/**
 * Stress-seed script for scalability validation.
 *
 * Usage:
 *   $env:ALLOW_STRESS_SEED='true'; $env:DATABASE_URL='<neon-branch-url>'; npm run db:seed:stress
 *
 * Safety:
 *   - Requires ALLOW_STRESS_SEED=true.
 *   - Must run against a Neon **branch**, never production.
 *   - All synthetic rows use a "stress-" prefix so they are easy to identify.
 *   - Uses one precomputed bcrypt hash for all users (fast).
 *   - Inserts in batches of BATCH_SIZE to stay within payload/memory limits.
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import {
  users,
  courses,
  modules,
  materials,
  posts,
  comments,
  favorites,
  courseMembers,
  postLikes,
  postBookmarks,
  activityLogs,
} from "./schema";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 500;

const COUNTS = {
  users: 10_000,
  courses: 1_000,
  modules: 3_000,
  materials: 10_000,
  posts: 10_000,
  comments: 20_000,
  favorites: 5_000,
  courseMembers: 2_000,
  postLikes: 15_000,
  postBookmarks: 5_000,
  activityLogs: 10_000,
};

// Precompute once — saves ~10 000 bcrypt rounds.
const STRESS_PASSWORD_HASH = hashSync("stress-pass-123", 10);

const POST_TYPES = ["discussion", "question", "resource", "article"] as const;
const MATERIAL_TYPES = ["text", "link", "file"] as const;
const ACTION_TYPES = [
  "login",
  "create_course",
  "create_post",
  "create_material",
  "enroll_course",
  "view_material",
  "like_post",
  "bookmark_post",
  "add_comment",
  "update_profile",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic pseudo-random based on seed (simple LCG). */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s;
  };
}

const rng = lcg(42);

function pick<T>(arr: readonly T[]): T {
  return arr[rng() % arr.length];
}

/** Return a random integer in [1, max]. */
function randId(max: number): number {
  return (rng() % max) + 1;
}

/** Spread dates over the last 365 days for realistic ORDER BY distribution. */
function spreadDate(i: number, total: number): Date {
  const now = Date.now();
  const yearMs = 365 * 24 * 60 * 60 * 1000;
  return new Date(now - yearMs + (i / total) * yearMs);
}

/** Insert rows in batches. */
async function batchInsert<T extends Record<string, unknown>>(
  db: ReturnType<typeof drizzle>,
  table: Parameters<ReturnType<typeof drizzle>["insert"]>[0],
  rows: T[],
  label: string
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(table).values(batch as never);
    const done = Math.min(i + BATCH_SIZE, rows.length);
    process.stdout.write(`\r  ${label}: ${done}/${rows.length}`);
  }
  console.log();
}

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

function requireStressConfirmation() {
  if (process.env.ALLOW_STRESS_SEED !== "true") {
    console.error("Refusing to run without ALLOW_STRESS_SEED=true.");
    console.error("This script inserts tens of thousands of rows.");
    console.error("Run ONLY against a Neon branch, NEVER production.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seedStress() {
  requireStressConfirmation();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (databaseUrl.includes("pooler") && !databaseUrl.includes("branch")) {
    console.warn(
      "⚠  DATABASE_URL looks like it points to the main pooler, not a branch."
    );
    console.warn("   Double-check before continuing.\n");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  const t0 = Date.now();
  console.log("=== StudyHub stress seed ===\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const userRoles = ["user", "user", "user", "user", "mentor"] as const; // 80% user, 20% mentor
  const userRows = Array.from({ length: COUNTS.users }, (_, i) => ({
    email: `stress-user-${i}@test.local`,
    name: `Stress User ${i}`,
    passwordHash: STRESS_PASSWORD_HASH,
    role: userRoles[i % userRoles.length],
    blocked: false,
  }));
  await batchInsert(db, users, userRows, "users");

  // We need the actual inserted IDs to satisfy FKs.
  // Query the range of stress user IDs.
  const idResult = await sql`SELECT MIN(id) AS min_id, MAX(id) AS max_id FROM users WHERE email LIKE 'stress-%'`;
  const userMinId = Number(idResult[0].min_id);
  const userMaxId = Number(idResult[0].max_id);
  const userCount = userMaxId - userMinId + 1;

  /** Map a 0-based stress index to a real user ID. */
  const uid = (i: number) => userMinId + (i % userCount);

  // ── 2. Courses ────────────────────────────────────────────────────────────
  const courseRows = Array.from({ length: COUNTS.courses }, (_, i) => ({
    title: `Stress Course ${i}`,
    description: `Auto-generated course #${i} for scalability validation.`,
    createdBy: uid(i),
    isPublic: true,
    status: "published" as const,
    createdAt: spreadDate(i, COUNTS.courses),
  }));
  await batchInsert(db, courses, courseRows, "courses");

  const cIdRes = await sql`SELECT MIN(id) AS min_id FROM courses WHERE title LIKE 'Stress Course%'`;
  const courseMinId = Number(cIdRes[0].min_id);
  const cid = (i: number) => courseMinId + (i % COUNTS.courses);

  // ── 3. Modules ────────────────────────────────────────────────────────────
  const moduleRows = Array.from({ length: COUNTS.modules }, (_, i) => ({
    courseId: cid(i),
    title: `Stress Module ${i}`,
    description: `Module #${i} content placeholder.`,
    orderIndex: i % 5,
    createdBy: uid(i),
  }));
  await batchInsert(db, modules, moduleRows, "modules");

  const mIdRes = await sql`SELECT MIN(id) AS min_id FROM modules WHERE title LIKE 'Stress Module%'`;
  const moduleMinId = Number(mIdRes[0].min_id);
  const mid = (i: number) => moduleMinId + (i % COUNTS.modules);

  // ── 4. Materials ──────────────────────────────────────────────────────────
  const matRows = Array.from({ length: COUNTS.materials }, (_, i) => ({
    moduleId: mid(i),
    title: `Stress Material ${i}`,
    content: `Content for material #${i}. This is synthetic data for load testing.`,
    materialType: pick(MATERIAL_TYPES),
    createdBy: uid(i),
    createdAt: spreadDate(i, COUNTS.materials),
  }));
  await batchInsert(db, materials, matRows, "materials");

  const matIdRes = await sql`SELECT MIN(id) AS min_id FROM materials WHERE title LIKE 'Stress Material%'`;
  const matMinId = Number(matIdRes[0].min_id);
  const matid = (i: number) => matMinId + (i % COUNTS.materials);

  // ── 5. Posts ──────────────────────────────────────────────────────────────
  const postRows = Array.from({ length: COUNTS.posts }, (_, i) => ({
    authorId: uid(i),
    title: `Stress Post ${i}`,
    content: `Discussion content for post #${i}. Generated for scalability testing.`,
    postType: pick(POST_TYPES),
    status: "approved" as const,
    courseId: i % 3 === 0 ? cid(i) : null,
    isPinned: false,
    createdAt: spreadDate(i, COUNTS.posts),
    updatedAt: spreadDate(i, COUNTS.posts),
  }));
  await batchInsert(db, posts, postRows, "posts");

  const pIdRes = await sql`SELECT MIN(id) AS min_id FROM posts WHERE title LIKE 'Stress Post%'`;
  const postMinId = Number(pIdRes[0].min_id);
  const pid = (i: number) => postMinId + (i % COUNTS.posts);

  // ── 6. Comments ───────────────────────────────────────────────────────────
  const commentRows = Array.from({ length: COUNTS.comments }, (_, i) => ({
    postId: pid(i),
    authorId: uid(randId(userCount) - 1),
    content: `Stress comment #${i} on post.`,
    createdAt: spreadDate(i, COUNTS.comments),
  }));
  await batchInsert(db, comments, commentRows, "comments");

  // ── 7. Favorites (user, material unique) ──────────────────────────────────
  const favSet = new Set<string>();
  const favRows: { userId: number; materialId: number }[] = [];
  let attempts = 0;
  while (favRows.length < COUNTS.favorites && attempts < COUNTS.favorites * 3) {
    const u = uid(randId(userCount) - 1);
    const m = matid(randId(COUNTS.materials) - 1);
    const key = `${u}-${m}`;
    if (!favSet.has(key)) {
      favSet.add(key);
      favRows.push({ userId: u, materialId: m });
    }
    attempts++;
  }
  await batchInsert(db, favorites, favRows, "favorites");

  // ── 8. Course Members (course, user unique) ───────────────────────────────
  const cmSet = new Set<string>();
  const cmRows: { courseId: number; userId: number; role: string }[] = [];
  attempts = 0;
  while (cmRows.length < COUNTS.courseMembers && attempts < COUNTS.courseMembers * 3) {
    const c = cid(randId(COUNTS.courses) - 1);
    const u = uid(randId(userCount) - 1);
    const key = `${c}-${u}`;
    if (!cmSet.has(key)) {
      cmSet.add(key);
      cmRows.push({ courseId: c, userId: u, role: "student" });
    }
    attempts++;
  }
  await batchInsert(db, courseMembers, cmRows, "course_members");

  // ── 9. Post Likes (post, user unique) ─────────────────────────────────────
  const plSet = new Set<string>();
  const plRows: { postId: number; userId: number }[] = [];
  attempts = 0;
  while (plRows.length < COUNTS.postLikes && attempts < COUNTS.postLikes * 3) {
    const p = pid(randId(COUNTS.posts) - 1);
    const u = uid(randId(userCount) - 1);
    const key = `${p}-${u}`;
    if (!plSet.has(key)) {
      plSet.add(key);
      plRows.push({ postId: p, userId: u });
    }
    attempts++;
  }
  await batchInsert(db, postLikes, plRows, "post_likes");

  // ── 10. Post Bookmarks (post, user unique) ────────────────────────────────
  const pbSet = new Set<string>();
  const pbRows: { postId: number; userId: number }[] = [];
  attempts = 0;
  while (pbRows.length < COUNTS.postBookmarks && attempts < COUNTS.postBookmarks * 3) {
    const p = pid(randId(COUNTS.posts) - 1);
    const u = uid(randId(userCount) - 1);
    const key = `${p}-${u}`;
    if (!pbSet.has(key)) {
      pbSet.add(key);
      pbRows.push({ postId: p, userId: u });
    }
    attempts++;
  }
  await batchInsert(db, postBookmarks, pbRows, "post_bookmarks");

  // ── 11. Activity Logs ─────────────────────────────────────────────────────
  const logRows = Array.from({ length: COUNTS.activityLogs }, (_, i) => ({
    userId: uid(i),
    actionType: pick(ACTION_TYPES),
    targetId: randId(1000),
    details: { source: "stress-seed", index: i },
    createdAt: spreadDate(i, COUNTS.activityLogs),
  }));
  await batchInsert(db, activityLogs, logRows, "activity_logs");

  // ── Summary ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n=== Stress seed complete in ${elapsed}s ===`);
  console.log(`  users:          ${userRows.length}`);
  console.log(`  courses:        ${courseRows.length}`);
  console.log(`  modules:        ${moduleRows.length}`);
  console.log(`  materials:      ${matRows.length}`);
  console.log(`  posts:          ${postRows.length}`);
  console.log(`  comments:       ${commentRows.length}`);
  console.log(`  favorites:      ${favRows.length}`);
  console.log(`  course_members: ${cmRows.length}`);
  console.log(`  post_likes:     ${plRows.length}`);
  console.log(`  post_bookmarks: ${pbRows.length}`);
  console.log(`  activity_logs:  ${logRows.length}`);
  console.log(`\n  Total rows: ~${Object.values(COUNTS).reduce((a, b) => a + b, 0).toLocaleString()}`);
}

seedStress().catch((err) => {
  console.error("Stress seed failed:", err);
  process.exit(1);
});
