ALTER TABLE "users" ADD COLUMN "auth_provider_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "user_auth_provider_idx" ON "users" USING btree ("auth_provider_id");