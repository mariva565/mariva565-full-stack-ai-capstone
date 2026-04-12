-- S1: Community Board — posts, comments, post_likes, post_bookmarks

CREATE TABLE "posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "author_id" integer NOT NULL REFERENCES "users"("id"),
  "title" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "post_type" varchar(20) NOT NULL DEFAULT 'discussion',
  "status" varchar(20) NOT NULL DEFAULT 'approved',
  "course_id" integer REFERENCES "courses"("id") ON DELETE SET NULL,
  "is_pinned" boolean NOT NULL DEFAULT false,
  "question_status" varchar(20),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "comments" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "author_id" integer NOT NULL REFERENCES "users"("id"),
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "post_likes" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "post_likes_post_user_idx" UNIQUE("post_id", "user_id")
);

CREATE TABLE "post_bookmarks" (
  "id" serial PRIMARY KEY NOT NULL,
  "post_id" integer NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "post_bookmarks_post_user_idx" UNIQUE("post_id", "user_id")
);
