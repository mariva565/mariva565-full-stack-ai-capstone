CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "course_members_user_id_idx" ON "course_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "materials_module_id_idx" ON "materials" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "materials_created_by_idx" ON "materials" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "modules_course_id_idx" ON "modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "modules_created_by_idx" ON "modules" USING btree ("created_by");
