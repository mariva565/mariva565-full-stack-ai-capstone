import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function run() {
  try {
    const sharedRecords = await db
      .select({
        id: schema.materials.id,
        title: schema.materials.title,
        materialType: schema.materials.materialType,
        fileUrl: schema.materials.fileUrl,
        createdAt: schema.materials.createdAt,
        sharedAt: schema.sharedMaterials.createdAt,
        sharedByEmail: schema.users.email,
        sharedByName: schema.users.name,
        moduleTitle: schema.modules.title,
        courseTitle: schema.courses.title,
        content: schema.materials.content,
      })
      .from(schema.sharedMaterials)
      .innerJoin(schema.materials, eq(schema.sharedMaterials.materialId, schema.materials.id))
      .innerJoin(schema.users, eq(schema.sharedMaterials.sharedByUserId, schema.users.id))
      .innerJoin(schema.modules, eq(schema.materials.moduleId, schema.modules.id))
      .innerJoin(schema.courses, eq(schema.modules.courseId, schema.courses.id))
      .where(eq(schema.sharedMaterials.sharedWithUserId, 1))
      .orderBy(desc(schema.sharedMaterials.createdAt));
      
    console.log("Success for user 1!", sharedRecords.length);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
run();
