import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL);

const milestoneId = Number.parseInt(process.argv[2], 10);
if (!Number.isInteger(milestoneId)) {
  console.error("Usage: node scripts/mark-milestone-done.mjs <milestoneId>");
  process.exit(1);
}

const [updated] = await sql`
  UPDATE milestones
  SET status = 'done', completed_at = NOW()
  WHERE id = ${milestoneId}
  RETURNING id, title, status, completed_at
`;

if (!updated) {
  console.error(`No milestone with id=${milestoneId}`);
  process.exit(1);
}

console.log(`✅ #${updated.id}  ${updated.title}`);
console.log(`   status=${updated.status}, completed_at=${updated.completed_at}`);
