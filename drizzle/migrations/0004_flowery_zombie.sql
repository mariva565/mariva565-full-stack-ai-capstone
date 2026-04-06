CREATE TABLE "ai_tool_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"tool" varchar(32) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_tool_outputs" ADD CONSTRAINT "ai_tool_outputs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tool_outputs" ADD CONSTRAINT "ai_tool_outputs_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_tool_outputs_user_material_idx" ON "ai_tool_outputs" USING btree ("user_id","material_id");--> statement-breakpoint
CREATE INDEX "ai_tool_outputs_material_created_idx" ON "ai_tool_outputs" USING btree ("material_id","created_at");