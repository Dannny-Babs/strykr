import { daysBetween } from "../normalization";
import { duplicateException, evaluatePairRules, evaluateTransactionRules, missingRegistrationException, missingTransactionException } from "./rules";
import type { ExceptionOutput, MatchResultOutput, ReconciliationOutput, ReconciliationRegistrationRecord, ReconciliationTransaction, ReportingPeriodInput, RuleConfiguration, TransactionOutcome } from "./types";

export const RULE_VERSION = "ruleset-v1";
export const DEFAULT_RULE_CONFIGURATION: RuleConfiguration = { dateToleranceDays: 7, evidenceRequiredTypes: ["WHOLESALE", "CANCELLED", "EXPORT"] };

export function reconcile(input: { transactions: ReconciliationTransaction[]; registrationRecords: ReconciliationRegistrationRecord[]; period: ReportingPeriodInput; configuration?: Partial<RuleConfiguration>; ruleVersion?: string }): ReconciliationOutput {
  const configuration = { ...DEFAULT_RULE_CONFIGURATION, ...input.configuration };
  const matches: MatchResultOutput[] = [];
  const exceptions: ExceptionOutput[] = [];
  const usedRegistrationIds = new Set<string>();
  const registrationByVin = new Map<string, ReconciliationRegistrationRecord[]>();
  const transactionVinCounts = new Map<string, number>();

  for (const record of input.registrationRecords) registrationByVin.set(record.normalizedVin, [...(registrationByVin.get(record.normalizedVin) ?? []), record]);
  for (const transaction of input.transactions) transactionVinCounts.set(transaction.normalizedVin, (transactionVinCounts.get(transaction.normalizedVin) ?? 0) + 1);

  for (const transaction of [...input.transactions].sort((a, b) => a.id.localeCompare(b.id))) {
    exceptions.push(...evaluateTransactionRules(transaction, input.period, configuration));
    const duplicateCount = transactionVinCounts.get(transaction.normalizedVin) ?? 0;
    if (duplicateCount > 1) exceptions.push(duplicateException(transaction, duplicateCount));
    const candidate = (registrationByVin.get(transaction.normalizedVin) ?? [])
      .filter((record) => !usedRegistrationIds.has(record.id))
      .sort((a, b) => daysBetween(transaction.transactionDate, a.registrationDate) - daysBetween(transaction.transactionDate, b.registrationDate) || a.id.localeCompare(b.id))[0];
    if (!candidate) {
      matches.push({ transactionId: transaction.id, registrationRecordId: null, matchType: "UNMATCHED_TRANSACTION", matchScore: 0, matchedFields: [], conflictingFields: ["vin"] });
      exceptions.push(missingRegistrationException(transaction));
      continue;
    }
    usedRegistrationIds.add(candidate.id);
    const dateVariance = daysBetween(transaction.transactionDate, candidate.registrationDate);
    matches.push({ transactionId: transaction.id, registrationRecordId: candidate.id, matchType: dateVariance > configuration.dateToleranceDays ? "EXACT_WITH_DATE_VARIANCE" : "EXACT", matchScore: dateVariance > configuration.dateToleranceDays ? 0.85 : 1, matchedFields: ["vin", "dealershipId"], conflictingFields: dateVariance > configuration.dateToleranceDays ? ["date"] : [] });
    exceptions.push(...evaluatePairRules({ transaction, registration: candidate }, configuration));
  }

  for (const registration of input.registrationRecords.filter((record) => !usedRegistrationIds.has(record.id))) {
    matches.push({ transactionId: null, registrationRecordId: registration.id, matchType: "UNMATCHED_REGISTRATION", matchScore: 0, matchedFields: [], conflictingFields: ["vin"] });
    exceptions.push(missingTransactionException(registration));
  }

  const uniqueExceptions = Array.from(new Map(exceptions.map((item) => [`${item.ruleId}:${item.transactionId ?? ""}:${item.registrationRecordId ?? ""}`, item])).values());
  const transactionOutcomes: TransactionOutcome[] = input.transactions.map((transaction) => {
    const related = uniqueExceptions.filter((item) => item.transactionId === transaction.id);
    if (!related.length) return { transactionId: transaction.id, state: "MATCHED" };
    if (related.some((item) => item.ruleId === "TXN002")) return { transactionId: transaction.id, state: "UNMATCHED" };
    if (related.some((item) => item.ruleId === "DOC001")) return { transactionId: transaction.id, state: "EVIDENCE_REQUIRED" };
    return { transactionId: transaction.id, state: "REVIEW_REQUIRED" };
  });
  const matchedCount = matches.filter((match) => match.matchType === "EXACT").length;
  const warningCount = matches.filter((match) => match.matchType === "EXACT_WITH_DATE_VARIANCE").length;
  return { ruleVersion: input.ruleVersion ?? RULE_VERSION, matches, exceptions: uniqueExceptions, transactionOutcomes, metrics: { transactionCount: input.transactions.length, registrationRecordCount: input.registrationRecords.length, matchedCount, warningCount, exceptionCount: uniqueExceptions.length } };
}
