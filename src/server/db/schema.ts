import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(), name: text("name").notNull(), type: text("type").notNull(), status: text("status").notNull().default("ACTIVE"), ...timestamps,
});

export const dealerships = sqliteTable("dealerships", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id), legalName: text("legal_name").notNull(), tradeName: text("trade_name").notNull(), registrationNumber: text("registration_number").notNull(), address: text("address"), city: text("city").notNull(), province: text("province").notNull().default("ON"), postalCode: text("postal_code"), contactName: text("contact_name"), contactEmail: text("contact_email"), contactPhone: text("contact_phone"), status: text("status").notNull().default("ACTIVE"), ...timestamps,
}, (table) => [uniqueIndex("dealership_registration_idx").on(table.registrationNumber), index("dealership_org_idx").on(table.organizationId)]);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id), dealershipId: text("dealership_id").references(() => dealerships.id), name: text("name").notNull(), email: text("email").notNull(), passwordHash: text("password_hash"), role: text("role").notNull(), status: text("status").notNull().default("ACTIVE"), onboardingData: text("onboarding_data").notNull().default("{}"), onboardingCompletedAt: text("onboarding_completed_at"), lastSignedInAt: text("last_signed_in_at"), ...timestamps,
}, (table) => [uniqueIndex("user_email_idx").on(table.email), index("user_dealership_idx").on(table.dealershipId)]);

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), tokenHash: text("token_hash").notNull(), expiresAt: text("expires_at").notNull(), createdAt: text("created_at").notNull(), lastSeenAt: text("last_seen_at").notNull(),
}, (table) => [uniqueIndex("auth_session_token_idx").on(table.tokenHash), index("auth_session_user_idx").on(table.userId), index("auth_session_expiry_idx").on(table.expiresAt)]);

export const reportingPeriods = sqliteTable("reporting_periods", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), name: text("name").notNull(), startDate: text("start_date").notNull(), endDate: text("end_date").notNull(), status: text("status").notNull().default("OPEN"), createdAt: text("created_at").notNull(), closedAt: text("closed_at"),
}, (table) => [index("period_dealership_idx").on(table.dealershipId), index("period_status_idx").on(table.status)]);

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(), vin: text("vin").notNull(), normalizedVin: text("normalized_vin").notNull(), year: integer("year"), make: text("make"), model: text("model"), trim: text("trim"), stockNumber: text("stock_number"), ...timestamps,
}, (table) => [uniqueIndex("vehicle_vin_idx").on(table.normalizedVin), index("vehicle_stock_idx").on(table.stockNumber)]);

export const importBatches = sqliteTable("import_batches", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), sourceType: text("source_type").notNull(), fileName: text("file_name").notNull(), status: text("status").notNull(), totalRows: integer("total_rows").notNull().default(0), validRows: integer("valid_rows").notNull().default(0), warningRows: integer("warning_rows").notNull().default(0), rejectedRows: integer("rejected_rows").notNull().default(0), duplicateRows: integer("duplicate_rows").notNull().default(0), createdBy: text("created_by").notNull().references(() => users.id), createdAt: text("created_at").notNull(), completedAt: text("completed_at"),
}, (table) => [index("batch_dealer_period_idx").on(table.dealershipId, table.reportingPeriodId), index("batch_status_idx").on(table.status)]);

export const importRecords = sqliteTable("import_records", {
  id: text("id").primaryKey(), batchId: text("batch_id").notNull().references(() => importBatches.id), rowNumber: integer("row_number").notNull(), rawRecord: text("raw_record").notNull(), normalizedRecord: text("normalized_record"), status: text("status").notNull(), warnings: text("warnings").notNull().default("[]"), errors: text("errors").notNull().default("[]"), createdAt: text("created_at").notNull(),
}, (table) => [index("import_record_batch_idx").on(table.batchId), uniqueIndex("import_record_row_idx").on(table.batchId, table.rowNumber)]);

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), vehicleId: text("vehicle_id").notNull().references(() => vehicles.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), vin: text("vin").notNull(), normalizedVin: text("normalized_vin").notNull(), transactionType: text("transaction_type").notNull(), transactionDate: text("transaction_date").notNull(), deliveryDate: text("delivery_date"), transactionStatus: text("transaction_status").notNull().default("ACTIVE"), reportableStatus: text("reportable_status").notNull().default("REPORTABLE"), reconciliationState: text("reconciliation_state").notNull().default("UNMATCHED"), feeRequired: integer("fee_required", { mode: "boolean" }).notNull(), expectedFee: real("expected_fee").notNull().default(0), reportedFee: real("reported_fee").notNull().default(0), source: text("source").notNull(), sourceRecordId: text("source_record_id").notNull(), importBatchId: text("import_batch_id").references(() => importBatches.id), originalValues: text("original_values").notNull().default("{}"), correctedValues: text("corrected_values").notNull().default("{}"), ...timestamps,
}, (table) => [index("transaction_vin_idx").on(table.normalizedVin), index("transaction_dealer_period_idx").on(table.dealershipId, table.reportingPeriodId), index("transaction_state_idx").on(table.reconciliationState), uniqueIndex("transaction_source_idx").on(table.dealershipId, table.source, table.sourceRecordId)]);

export const registrationRecords = sqliteTable("registration_records", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), vehicleId: text("vehicle_id").notNull().references(() => vehicles.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), vin: text("vin").notNull(), normalizedVin: text("normalized_vin").notNull(), registrationDate: text("registration_date").notNull(), eventType: text("event_type").notNull(), source: text("source").notNull(), sourceRecordId: text("source_record_id").notNull(), importBatchId: text("import_batch_id").references(() => importBatches.id), originalValues: text("original_values").notNull().default("{}"), createdAt: text("created_at").notNull(),
}, (table) => [index("registration_vin_idx").on(table.normalizedVin), index("registration_dealer_period_idx").on(table.dealershipId, table.reportingPeriodId), uniqueIndex("registration_source_idx").on(table.dealershipId, table.source, table.sourceRecordId)]);

export const listingObservations = sqliteTable("listing_observations", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), vehicleId: text("vehicle_id").references(() => vehicles.id), vin: text("vin").notNull(), normalizedVin: text("normalized_vin").notNull(), source: text("source").notNull(), sourceUrl: text("source_url").notNull(), observedAt: text("observed_at").notNull(), listingStatus: text("listing_status").notNull(), price: real("price"), extractionMethod: text("extraction_method").notNull(), confidence: real("confidence"), createdAt: text("created_at").notNull(),
}, (table) => [index("listing_vin_idx").on(table.normalizedVin), index("listing_dealer_idx").on(table.dealershipId)]);

export const reconciliationRuns = sqliteTable("reconciliation_runs", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), status: text("status").notNull(), ruleVersion: text("rule_version").notNull(), transactionCount: integer("transaction_count").notNull(), registrationRecordCount: integer("registration_record_count").notNull(), matchedCount: integer("matched_count").notNull().default(0), warningCount: integer("warning_count").notNull().default(0), exceptionCount: integer("exception_count").notNull().default(0), startedBy: text("started_by").notNull().references(() => users.id), startedAt: text("started_at").notNull(), completedAt: text("completed_at"),
}, (table) => [index("run_dealer_period_idx").on(table.dealershipId, table.reportingPeriodId), index("run_started_idx").on(table.startedAt)]);

export const matchResults = sqliteTable("match_results", {
  id: text("id").primaryKey(), reconciliationRunId: text("reconciliation_run_id").notNull().references(() => reconciliationRuns.id), transactionId: text("transaction_id").references(() => transactions.id), registrationRecordId: text("registration_record_id").references(() => registrationRecords.id), matchType: text("match_type").notNull(), matchScore: real("match_score").notNull(), matchedFields: text("matched_fields").notNull().default("[]"), conflictingFields: text("conflicting_fields").notNull().default("[]"), createdAt: text("created_at").notNull(),
}, (table) => [index("match_run_idx").on(table.reconciliationRunId), index("match_transaction_idx").on(table.transactionId)]);

export const exceptions = sqliteTable("exceptions", {
  id: text("id").primaryKey(), reconciliationRunId: text("reconciliation_run_id").notNull().references(() => reconciliationRuns.id), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), transactionId: text("transaction_id").references(() => transactions.id), registrationRecordId: text("registration_record_id").references(() => registrationRecords.id), vehicleId: text("vehicle_id").references(() => vehicles.id), vin: text("vin").notNull(), normalizedVin: text("normalized_vin").notNull(), ruleId: text("rule_id").notNull(), type: text("type").notNull(), priority: text("priority").notNull(), status: text("status").notNull().default("NEW"), summary: text("summary").notNull(), explanation: text("explanation").notNull(), triggeringValues: text("triggering_values").notNull().default("{}"), recommendedAction: text("recommended_action").notNull(), estimatedFeeImpact: real("estimated_fee_impact").notNull().default(0), assignedTo: text("assigned_to").references(() => users.id), dueDate: text("due_date"), resolutionType: text("resolution_type"), resolutionReason: text("resolution_reason"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(), resolvedAt: text("resolved_at"),
}, (table) => [index("exception_run_idx").on(table.reconciliationRunId), index("exception_dealer_status_idx").on(table.dealershipId, table.status), index("exception_vin_idx").on(table.normalizedVin), index("exception_type_idx").on(table.type)]);

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), transactionId: text("transaction_id").references(() => transactions.id), exceptionId: text("exception_id").references(() => exceptions.id), fileName: text("file_name").notNull(), documentType: text("document_type").notNull(), storageReference: text("storage_reference").notNull(), mimeType: text("mime_type").notNull(), fileSize: integer("file_size").notNull(), extractionStatus: text("extraction_status").notNull().default("NOT_REQUESTED"), extractedData: text("extracted_data"), validationStatus: text("validation_status").notNull().default("PENDING"), uploadedBy: text("uploaded_by").notNull().references(() => users.id), uploadedAt: text("uploaded_at").notNull(),
}, (table) => [index("document_dealer_idx").on(table.dealershipId), index("document_exception_idx").on(table.exceptionId)]);

export const evidence = sqliteTable("evidence", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), vehicleId: text("vehicle_id").references(() => vehicles.id), transactionId: text("transaction_id").references(() => transactions.id), exceptionId: text("exception_id").references(() => exceptions.id), documentId: text("document_id").references(() => documents.id), type: text("type").notNull(), source: text("source").notNull(), description: text("description").notNull(), sourceReference: text("source_reference"), extractionMethod: text("extraction_method"), observedAt: text("observed_at").notNull(), confidence: real("confidence"), validationStatus: text("validation_status").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("evidence_exception_idx").on(table.exceptionId), index("evidence_transaction_idx").on(table.transactionId)]);

export const dealerResponses = sqliteTable("dealer_responses", {
  id: text("id").primaryKey(), exceptionId: text("exception_id").notNull().references(() => exceptions.id), submittedBy: text("submitted_by").notNull().references(() => users.id), explanationCategory: text("explanation_category").notNull(), explanation: text("explanation").notNull(), status: text("status").notNull(), submittedAt: text("submitted_at").notNull(), reviewedAt: text("reviewed_at"), reviewedBy: text("reviewed_by").references(() => users.id),
}, (table) => [index("response_exception_idx").on(table.exceptionId)]);

export const audits = sqliteTable("audits", {
  id: text("id").primaryKey(), dealershipId: text("dealership_id").notNull().references(() => dealerships.id), reportingPeriodId: text("reporting_period_id").notNull().references(() => reportingPeriods.id), name: text("name").notNull(), scope: text("scope").notNull(), status: text("status").notNull(), assignedReviewer: text("assigned_reviewer").references(() => users.id), startedAt: text("started_at"), dueAt: text("due_at"), completedAt: text("completed_at"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("audit_dealer_period_idx").on(table.dealershipId, table.reportingPeriodId), index("audit_status_idx").on(table.status)]);

export const auditFindings = sqliteTable("audit_findings", {
  id: text("id").primaryKey(), auditId: text("audit_id").notNull().references(() => audits.id), exceptionId: text("exception_id").notNull().references(() => exceptions.id), type: text("type").notNull(), title: text("title").notNull(), description: text("description").notNull(), evidenceIds: text("evidence_ids").notNull().default("[]"), feeImpact: real("fee_impact").notNull().default(0), conclusion: text("conclusion"), status: text("status").notNull(), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("finding_audit_idx").on(table.auditId), index("finding_exception_idx").on(table.exceptionId)]);

export const activityEvents = sqliteTable("activity_events", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organizations.id), dealershipId: text("dealership_id").references(() => dealerships.id), actorId: text("actor_id").notNull().references(() => users.id), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), action: text("action").notNull(), metadata: text("metadata").notNull().default("{}"), timestamp: text("timestamp").notNull(),
}, (table) => [index("activity_entity_idx").on(table.entityType, table.entityId), index("activity_dealer_time_idx").on(table.dealershipId, table.timestamp)]);

export const reconciliationRules = sqliteTable("reconciliation_rules", {
  id: text("id").primaryKey(), code: text("code").notNull(), name: text("name").notNull(), description: text("description").notNull(), severity: text("severity").notNull(), category: text("category").notNull(), enabled: integer("enabled", { mode: "boolean" }).notNull().default(true), version: text("version").notNull(), configuration: text("configuration").notNull().default("{}"),
}, (table) => [uniqueIndex("rule_code_version_idx").on(table.code, table.version)]);

export const feeSchedules = sqliteTable("fee_schedules", {
  id: text("id").primaryKey(), amount: real("amount").notNull(), effectiveFrom: text("effective_from").notNull(), effectiveTo: text("effective_to"), jurisdiction: text("jurisdiction").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("fee_effective_idx").on(table.jurisdiction, table.effectiveFrom)]);

export type TransactionRow = typeof transactions.$inferSelect;
export type RegistrationRecordRow = typeof registrationRecords.$inferSelect;
export type ExceptionRow = typeof exceptions.$inferSelect;
