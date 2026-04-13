-- Mobile native push notifications: per-device token registry
CREATE TABLE "user_push_tokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "token" text NOT NULL,
  "platform" varchar(20) NOT NULL DEFAULT 'unknown',
  "app_ownership" varchar(20),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "last_seen_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "user_push_tokens"
ADD CONSTRAINT "user_push_tokens_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

CREATE UNIQUE INDEX "user_push_tokens_token_idx"
ON "user_push_tokens" ("token");

CREATE INDEX "user_push_tokens_user_active_idx"
ON "user_push_tokens" ("user_id", "is_active");
