import type { Priority, ReconciliationState, TransactionType } from "../enums";

export interface ReconciliationTransaction {
  id: string; dealershipId: string; vehicleId: string; reportingPeriodId: string; vin: string; normalizedVin: string;
  transactionType: TransactionType; transactionDate: string; feeRequired: boolean; expectedFee: number; reportedFee: number;
  transactionStatus: string; evidenceCount?: number;
}

export interface ReconciliationRegistrationRecord {
  id: string; dealershipId: string; vehicleId: string; reportingPeriodId: string; vin: string; normalizedVin: string;
  registrationDate: string; eventType: string;
}

export interface ReportingPeriodInput { id: string; dealershipId: string; startDate: string; endDate: string }

export interface RuleConfiguration { dateToleranceDays: number; evidenceRequiredTypes: TransactionType[] }

export interface MatchResultOutput {
  transactionId: string | null; registrationRecordId: string | null; matchType: "EXACT" | "EXACT_WITH_DATE_VARIANCE" | "UNMATCHED_TRANSACTION" | "UNMATCHED_REGISTRATION";
  matchScore: number; matchedFields: string[]; conflictingFields: string[];
}

export interface ExceptionOutput {
  transactionId: string | null; registrationRecordId: string | null; vehicleId: string | null; vin: string; normalizedVin: string;
  ruleId: string; type: string; priority: Priority; summary: string; explanation: string; triggeringValues: Record<string, unknown>;
  recommendedAction: string; estimatedFeeImpact: number;
}

export interface TransactionOutcome { transactionId: string; state: ReconciliationState }

export interface ReconciliationOutput {
  ruleVersion: string; matches: MatchResultOutput[]; exceptions: ExceptionOutput[]; transactionOutcomes: TransactionOutcome[];
  metrics: { transactionCount: number; registrationRecordCount: number; matchedCount: number; warningCount: number; exceptionCount: number };
}
