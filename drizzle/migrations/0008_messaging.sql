-- S3: Real-time Messaging — conversations, conversation_members, messages

CREATE TABLE "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "conversation_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "joined_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "conversation_members_conv_user_idx" UNIQUE("conversation_id", "user_id")
);

CREATE TABLE "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "sender_id" integer NOT NULL REFERENCES "users"("id"),
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX "messages_conversation_created_idx" ON "messages"("conversation_id", "created_at");
