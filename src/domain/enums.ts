export const organizationTypes = ["REGULATOR", "DEALERSHIP_GROUP", "DEALERSHIP", "COMPLIANCE_FIRM"] as const;
export const roles = ["REGULATOR_REVIEWER", "DEALER_ADMIN", "DEALER_USER", "SYSTEM_ADMIN"] as const;
export const importSourceTypes = ["TRANSACTION_REGISTER", "REGISTRATION_RECORD", "ACCOUNTING_EXPORT", "DMS_EXPORT", "LISTING_OBSERVATION", "PYTHON_EXTRACTION"] as const;
export const importStatuses = ["PENDING", "VALIDATING", "READY", "COMPLETED", "FAILED"] as const;
export const transactionTypes = ["RETAIL", "WHOLESALE", "LEASE", "FLEET", "EXPORT", "CANCELLED", "OTHER"] as const;
export const transactionStatuses = ["ACTIVE", "CANCELLED", "CORRECTED", "EXCLUDED"] as const;
export const reconciliationStates = ["MATCHED", "MATCHED_WITH_WARNING", "REVIEW_REQUIRED", "DEALER_RESPONSE_REQUIRED", "EVIDENCE_REQUIRED", "UNMATCHED", "EXCLUDED", "RESOLVED"] as const;
export const exceptionStatuses = ["NEW", "UNDER_REVIEW", "AWAITING_DEALER", "RESPONSE_RECEIVED", "REVIEWER_ACTION", "RESOLVED", "ESCALATED"] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const explanationCategories = ["WHOLESALE", "CANCELLED", "EXPORT", "LEASE", "FLEET", "DATE_DIFFERENCE", "VIN_CORRECTION", "DUPLICATE_ENTRY", "DIFFERENT_REPORTING_PERIOD", "ALREADY_REPORTED", "SUPPORTING_DOCUMENT_ATTACHED", "OTHER"] as const;

export type Role = (typeof roles)[number];
export type ImportSourceType = (typeof importSourceTypes)[number];
export type TransactionType = (typeof transactionTypes)[number];
export type ReconciliationState = (typeof reconciliationStates)[number];
export type ExceptionStatus = (typeof exceptionStatuses)[number];
export type Priority = (typeof priorities)[number];
