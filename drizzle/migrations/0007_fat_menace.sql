CREATE TABLE "shared_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer NOT NULL,
	"shared_with_user_id" integer NOT NULL,
	"shared_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shared_materials" ADD CONSTRAINT "shared_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_materials" ADD CONSTRAINT "shared_materials_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_materials" ADD CONSTRAINT "shared_materials_shared_by_user_id_users_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "shared_materials_material_user_idx" ON "shared_materials" USING btree ("material_id","shared_with_user_id");--> statement-breakpoint
CREATE INDEX "shared_materials_user_idx" ON "shared_materials" USING btree ("shared_with_user_id");