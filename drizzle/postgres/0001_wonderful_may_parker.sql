CREATE TABLE "auth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"consumed_at" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content_sha256" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "security_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "security_details" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" text;--> statement-breakpoint
UPDATE "documents" SET "content_sha256" = repeat('0', 64), "security_status" = 'REQUIRES_RESCAN', "security_details" = '{"migration":"legacy-document"}';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "content_sha256" SET NOT NULL;--> statement-breakpoint
UPDATE "users" SET "email_verified_at" = CURRENT_TIMESTAMP::text WHERE "email_verified_at" IS NULL;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_token_hash_idx" ON "auth_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_token_user_purpose_idx" ON "auth_tokens" USING btree ("user_id","purpose");--> statement-breakpoint
CREATE INDEX "auth_token_expiry_idx" ON "auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "rate_limit_reset_idx" ON "rate_limit_buckets" USING btree ("reset_at");
