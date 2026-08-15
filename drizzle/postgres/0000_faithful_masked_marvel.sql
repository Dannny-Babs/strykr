CREATE TABLE "activity_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"dealership_id" text,
	"actor_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"metadata" text DEFAULT '{}' NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_findings" (
	"id" text PRIMARY KEY NOT NULL,
	"audit_id" text NOT NULL,
	"exception_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"evidence_ids" text DEFAULT '[]' NOT NULL,
	"fee_impact" double precision DEFAULT 0 NOT NULL,
	"conclusion" text,
	"status" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"name" text NOT NULL,
	"scope" text NOT NULL,
	"status" text NOT NULL,
	"assigned_reviewer" text,
	"started_at" text,
	"due_at" text,
	"completed_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL,
	"last_seen_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealer_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"exception_id" text NOT NULL,
	"submitted_by" text NOT NULL,
	"explanation_category" text NOT NULL,
	"explanation" text NOT NULL,
	"status" text NOT NULL,
	"submitted_at" text NOT NULL,
	"reviewed_at" text,
	"reviewed_by" text
);
--> statement-breakpoint
CREATE TABLE "dealerships" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"legal_name" text NOT NULL,
	"trade_name" text NOT NULL,
	"registration_number" text NOT NULL,
	"address" text,
	"city" text NOT NULL,
	"province" text DEFAULT 'ON' NOT NULL,
	"postal_code" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"transaction_id" text,
	"exception_id" text,
	"file_name" text NOT NULL,
	"document_type" text NOT NULL,
	"storage_reference" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"extraction_status" text DEFAULT 'NOT_REQUESTED' NOT NULL,
	"extracted_data" text,
	"validation_status" text DEFAULT 'PENDING' NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"vehicle_id" text,
	"transaction_id" text,
	"exception_id" text,
	"document_id" text,
	"type" text NOT NULL,
	"source" text NOT NULL,
	"description" text NOT NULL,
	"source_reference" text,
	"extraction_method" text,
	"observed_at" text NOT NULL,
	"confidence" double precision,
	"validation_status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exceptions" (
	"id" text PRIMARY KEY NOT NULL,
	"reconciliation_run_id" text NOT NULL,
	"dealership_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"transaction_id" text,
	"registration_record_id" text,
	"vehicle_id" text,
	"vin" text NOT NULL,
	"normalized_vin" text NOT NULL,
	"rule_id" text NOT NULL,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"summary" text NOT NULL,
	"explanation" text NOT NULL,
	"triggering_values" text DEFAULT '{}' NOT NULL,
	"recommended_action" text NOT NULL,
	"estimated_fee_impact" double precision DEFAULT 0 NOT NULL,
	"assigned_to" text,
	"due_date" text,
	"resolution_type" text,
	"resolution_reason" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"resolved_at" text
);
--> statement-breakpoint
CREATE TABLE "fee_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"effective_from" text NOT NULL,
	"effective_to" text,
	"jurisdiction" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"dealership_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"source_type" text NOT NULL,
	"file_name" text NOT NULL,
	"status" text NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"valid_rows" integer DEFAULT 0 NOT NULL,
	"warning_rows" integer DEFAULT 0 NOT NULL,
	"rejected_rows" integer DEFAULT 0 NOT NULL,
	"duplicate_rows" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" text NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "import_records" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"row_number" integer NOT NULL,
	"raw_record" text NOT NULL,
	"normalized_record" text,
	"status" text NOT NULL,
	"warnings" text DEFAULT '[]' NOT NULL,
	"errors" text DEFAULT '[]' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"vehicle_id" text,
	"vin" text NOT NULL,
	"normalized_vin" text NOT NULL,
	"source" text NOT NULL,
	"source_url" text NOT NULL,
	"observed_at" text NOT NULL,
	"listing_status" text NOT NULL,
	"price" double precision,
	"extraction_method" text NOT NULL,
	"confidence" double precision,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_results" (
	"id" text PRIMARY KEY NOT NULL,
	"reconciliation_run_id" text NOT NULL,
	"transaction_id" text,
	"registration_record_id" text,
	"match_type" text NOT NULL,
	"match_score" double precision NOT NULL,
	"matched_fields" text DEFAULT '[]' NOT NULL,
	"conflicting_fields" text DEFAULT '[]' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"severity" text NOT NULL,
	"category" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"version" text NOT NULL,
	"configuration" text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"status" text NOT NULL,
	"rule_version" text NOT NULL,
	"transaction_count" integer NOT NULL,
	"registration_record_count" integer NOT NULL,
	"matched_count" integer DEFAULT 0 NOT NULL,
	"warning_count" integer DEFAULT 0 NOT NULL,
	"exception_count" integer DEFAULT 0 NOT NULL,
	"started_by" text NOT NULL,
	"started_at" text NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "registration_records" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"vin" text NOT NULL,
	"normalized_vin" text NOT NULL,
	"registration_date" text NOT NULL,
	"event_type" text NOT NULL,
	"source" text NOT NULL,
	"source_record_id" text NOT NULL,
	"import_batch_id" text,
	"original_values" text DEFAULT '{}' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reporting_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" text NOT NULL,
	"closed_at" text
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"dealership_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"reporting_period_id" text NOT NULL,
	"vin" text NOT NULL,
	"normalized_vin" text NOT NULL,
	"transaction_type" text NOT NULL,
	"transaction_date" text NOT NULL,
	"delivery_date" text,
	"transaction_status" text DEFAULT 'ACTIVE' NOT NULL,
	"reportable_status" text DEFAULT 'REPORTABLE' NOT NULL,
	"reconciliation_state" text DEFAULT 'UNMATCHED' NOT NULL,
	"fee_required" boolean NOT NULL,
	"expected_fee" double precision DEFAULT 0 NOT NULL,
	"reported_fee" double precision DEFAULT 0 NOT NULL,
	"source" text NOT NULL,
	"source_record_id" text NOT NULL,
	"import_batch_id" text,
	"original_values" text DEFAULT '{}' NOT NULL,
	"corrected_values" text DEFAULT '{}' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"dealership_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"role" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"onboarding_data" text DEFAULT '{}' NOT NULL,
	"onboarding_completed_at" text,
	"last_signed_in_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"vin" text NOT NULL,
	"normalized_vin" text NOT NULL,
	"year" integer,
	"make" text,
	"model" text,
	"trim" text,
	"stock_number" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_findings" ADD CONSTRAINT "audit_findings_exception_id_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_assigned_reviewer_users_id_fk" FOREIGN KEY ("assigned_reviewer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_responses" ADD CONSTRAINT "dealer_responses_exception_id_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_responses" ADD CONSTRAINT "dealer_responses_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_responses" ADD CONSTRAINT "dealer_responses_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealerships" ADD CONSTRAINT "dealerships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_exception_id_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_exception_id_exceptions_id_fk" FOREIGN KEY ("exception_id") REFERENCES "public"."exceptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_reconciliation_run_id_reconciliation_runs_id_fk" FOREIGN KEY ("reconciliation_run_id") REFERENCES "public"."reconciliation_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_registration_record_id_registration_records_id_fk" FOREIGN KEY ("registration_record_id") REFERENCES "public"."registration_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_observations" ADD CONSTRAINT "listing_observations_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_observations" ADD CONSTRAINT "listing_observations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_reconciliation_run_id_reconciliation_runs_id_fk" FOREIGN KEY ("reconciliation_run_id") REFERENCES "public"."reconciliation_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_registration_record_id_registration_records_id_fk" FOREIGN KEY ("registration_record_id") REFERENCES "public"."registration_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_started_by_users_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_records" ADD CONSTRAINT "registration_records_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_records" ADD CONSTRAINT "registration_records_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_records" ADD CONSTRAINT "registration_records_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_records" ADD CONSTRAINT "registration_records_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_periods" ADD CONSTRAINT "reporting_periods_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reporting_period_id_reporting_periods_id_fk" FOREIGN KEY ("reporting_period_id") REFERENCES "public"."reporting_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_import_batch_id_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_entity_idx" ON "activity_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "activity_dealer_time_idx" ON "activity_events" USING btree ("dealership_id","timestamp");--> statement-breakpoint
CREATE INDEX "finding_audit_idx" ON "audit_findings" USING btree ("audit_id");--> statement-breakpoint
CREATE INDEX "finding_exception_idx" ON "audit_findings" USING btree ("exception_id");--> statement-breakpoint
CREATE INDEX "audit_dealer_period_idx" ON "audits" USING btree ("dealership_id","reporting_period_id");--> statement-breakpoint
CREATE INDEX "audit_status_idx" ON "audits" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_session_token_idx" ON "auth_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_session_user_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_session_expiry_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "response_exception_idx" ON "dealer_responses" USING btree ("exception_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dealership_registration_idx" ON "dealerships" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "dealership_org_idx" ON "dealerships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "document_dealer_idx" ON "documents" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "document_exception_idx" ON "documents" USING btree ("exception_id");--> statement-breakpoint
CREATE INDEX "evidence_exception_idx" ON "evidence" USING btree ("exception_id");--> statement-breakpoint
CREATE INDEX "evidence_transaction_idx" ON "evidence" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "exception_run_idx" ON "exceptions" USING btree ("reconciliation_run_id");--> statement-breakpoint
CREATE INDEX "exception_dealer_status_idx" ON "exceptions" USING btree ("dealership_id","status");--> statement-breakpoint
CREATE INDEX "exception_vin_idx" ON "exceptions" USING btree ("normalized_vin");--> statement-breakpoint
CREATE INDEX "exception_type_idx" ON "exceptions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "fee_effective_idx" ON "fee_schedules" USING btree ("jurisdiction","effective_from");--> statement-breakpoint
CREATE INDEX "batch_dealer_period_idx" ON "import_batches" USING btree ("dealership_id","reporting_period_id");--> statement-breakpoint
CREATE INDEX "batch_status_idx" ON "import_batches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "import_record_batch_idx" ON "import_records" USING btree ("batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "import_record_row_idx" ON "import_records" USING btree ("batch_id","row_number");--> statement-breakpoint
CREATE INDEX "listing_vin_idx" ON "listing_observations" USING btree ("normalized_vin");--> statement-breakpoint
CREATE INDEX "listing_dealer_idx" ON "listing_observations" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "match_run_idx" ON "match_results" USING btree ("reconciliation_run_id");--> statement-breakpoint
CREATE INDEX "match_transaction_idx" ON "match_results" USING btree ("transaction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rule_code_version_idx" ON "reconciliation_rules" USING btree ("code","version");--> statement-breakpoint
CREATE INDEX "run_dealer_period_idx" ON "reconciliation_runs" USING btree ("dealership_id","reporting_period_id");--> statement-breakpoint
CREATE INDEX "run_started_idx" ON "reconciliation_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "registration_vin_idx" ON "registration_records" USING btree ("normalized_vin");--> statement-breakpoint
CREATE INDEX "registration_dealer_period_idx" ON "registration_records" USING btree ("dealership_id","reporting_period_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_source_idx" ON "registration_records" USING btree ("dealership_id","source","source_record_id");--> statement-breakpoint
CREATE INDEX "period_dealership_idx" ON "reporting_periods" USING btree ("dealership_id");--> statement-breakpoint
CREATE INDEX "period_status_idx" ON "reporting_periods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transaction_vin_idx" ON "transactions" USING btree ("normalized_vin");--> statement-breakpoint
CREATE INDEX "transaction_dealer_period_idx" ON "transactions" USING btree ("dealership_id","reporting_period_id");--> statement-breakpoint
CREATE INDEX "transaction_state_idx" ON "transactions" USING btree ("reconciliation_state");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_source_idx" ON "transactions" USING btree ("dealership_id","source","source_record_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_dealership_idx" ON "users" USING btree ("dealership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_vin_idx" ON "vehicles" USING btree ("normalized_vin");--> statement-breakpoint
CREATE INDEX "vehicle_stock_idx" ON "vehicles" USING btree ("stock_number");