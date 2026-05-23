import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL);

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/list-milestones.mjs <user-email>");
  process.exit(1);
}

const users = await sql`SELECT id, email FROM users WHERE email = ${email}`;
if (users.length === 0) {
  console.error(`No user found for ${email}`);
  process.exit(1);
}
const user = users[0];
console.log(`User: ${user.email} (id=${user.id})\n`);

const rows = await sql`
  SELECT id, title, status, due_date, completed_at, order_index
  FROM milestones
  WHERE user_id = ${user.id}
  ORDER BY order_index ASC, id ASC
`;

for (const m of rows) {
  const box = m.status === "done" ? "[x]" : m.status === "in_progress" ? "[~]" : "[ ]";
  console.log(`${box} #${m.id}  ${m.title}`);
  if (m.completed_at) console.log(`       completed: ${m.completed_at}`);
}
console.log(`\nTotal: ${rows.length}`);
