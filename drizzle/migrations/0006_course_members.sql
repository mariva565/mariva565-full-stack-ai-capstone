CREATE TABLE "course_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE cascade,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "role" varchar(20) NOT NULL DEFAULT 'student',
  "joined_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "course_members_course_user_idx" UNIQUE("course_id", "user_id")
);
