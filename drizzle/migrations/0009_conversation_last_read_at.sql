-- Messaging unread tracking: add per-member read cursor
ALTER TABLE "conversation_members"
ADD COLUMN "last_read_at" timestamp;

UPDATE "conversation_members"
SET "last_read_at" = now()
WHERE "last_read_at" IS NULL;

ALTER TABLE "conversation_members"
ALTER COLUMN "last_read_at" SET DEFAULT now();

ALTER TABLE "conversation_members"
ALTER COLUMN "last_read_at" SET NOT NULL;
