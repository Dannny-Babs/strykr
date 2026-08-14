import { daysBetween, validateVin } from "../normalization";
import type { ExceptionOutput, ReconciliationRegistrationRecord, ReconciliationTransaction, ReportingPeriodInput, RuleConfiguration } from "./types";

type Pair = { transaction: ReconciliationTransaction; registration: ReconciliationRegistrationRecord };

function exception(data: ExceptionOutput): ExceptionOutput { return data; }

export function evaluatePairRules(pair: Pair, config: RuleConfiguration): ExceptionOutput[] {
  const { transaction, registration } = pair;
  const results: ExceptionOutput[] = [];
  const varianceDays = daysBetween(transaction.transactionDate, registration.registrationDate);
  if (varianceDays > config.dateToleranceDays) results.push(exception({
    transactionId: transaction.id, registrationRecordId: registration.id, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin,
    ruleId: "DATE001", type: "DATE_VARIANCE", priority: "MEDIUM", summary: "Transaction and registration dates exceed the configured tolerance.",
    explanation: `Dealer transaction date ${transaction.transactionDate} and registration date ${registration.registrationDate} differ by ${varianceDays} days; the configured tolerance is ${config.dateToleranceDays} days.`,
    triggeringValues: { transactionDate: transaction.transactionDate, registrationDate: registration.registrationDate, varianceDays, toleranceDays: config.dateToleranceDays },
    recommendedAction: "Confirm the delivery and registration dates or provide supporting evidence for the timing difference.", estimatedFeeImpact: 0,
  }));
  const registrationType = registration.eventType.toUpperCase();
  if (registrationType && registrationType !== transaction.transactionType && registrationType !== "REGISTRATION") results.push(exception({
    transactionId: transaction.id, registrationRecordId: registration.id, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin,
    ruleId: "TYPE001", type: "CLASSIFICATION_DISCREPANCY", priority: "MEDIUM", summary: "Transaction classifications conflict across sources.",
    explanation: `The dealer record is classified as ${transaction.transactionType}, while the registration-style record is classified as ${registration.eventType}.`,
    triggeringValues: { transactionType: transaction.transactionType, registrationEventType: registration.eventType }, recommendedAction: "Review source documents and correct or explain the classification.", estimatedFeeImpact: 0,
  }));
  return results;
}

export function evaluateTransactionRules(transaction: ReconciliationTransaction, period: ReportingPeriodInput, config: RuleConfiguration): ExceptionOutput[] {
  const results: ExceptionOutput[] = [];
  const vinValidation = validateVin(transaction.vin);
  if (!vinValidation.valid) results.push(exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "VIN001", type: "INVALID_VIN", priority: "HIGH", summary: "VIN failed structural validation.", explanation: vinValidation.errors.join(" "), triggeringValues: { vin: transaction.vin, errors: vinValidation.errors }, recommendedAction: "Verify the VIN against the source record. Do not silently correct uncertain characters.", estimatedFeeImpact: 0 }));
  if (transaction.transactionDate < period.startDate || transaction.transactionDate > period.endDate) results.push(exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "PERIOD001", type: "REPORTING_PERIOD_DISCREPANCY", priority: "MEDIUM", summary: "Transaction date falls outside the reporting period.", explanation: `Transaction date ${transaction.transactionDate} is outside ${period.startDate} to ${period.endDate}.`, triggeringValues: { transactionDate: transaction.transactionDate, periodStart: period.startDate, periodEnd: period.endDate }, recommendedAction: "Move the record to the correct period or document why it belongs in this period.", estimatedFeeImpact: 0 }));
  if (transaction.feeRequired && transaction.reportedFee === 0) results.push(exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "FEE001", type: "MISSING_FEE", priority: "HIGH", summary: "A fee-required transaction contains no reported fee.", explanation: `The canonical transaction requires an estimated fee of $${transaction.expectedFee.toFixed(2)}, but the reported fee is $0.00.`, triggeringValues: { expectedFee: transaction.expectedFee, reportedFee: transaction.reportedFee }, recommendedAction: "Confirm whether the transaction is fee-applicable and correct the reported amount or provide an explanation.", estimatedFeeImpact: transaction.expectedFee }));
  else if (transaction.feeRequired && transaction.reportedFee !== transaction.expectedFee) results.push(exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "FEE002", type: "FEE_VARIANCE", priority: "HIGH", summary: "Reported fee differs from the configured expected fee.", explanation: `Expected fee is $${transaction.expectedFee.toFixed(2)} and reported fee is $${transaction.reportedFee.toFixed(2)}.`, triggeringValues: { expectedFee: transaction.expectedFee, reportedFee: transaction.reportedFee }, recommendedAction: "Review the applicable fee schedule and correct or explain the variance.", estimatedFeeImpact: transaction.expectedFee - transaction.reportedFee }));
  if (config.evidenceRequiredTypes.includes(transaction.transactionType) && (transaction.evidenceCount ?? 0) === 0) results.push(exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "DOC001", type: "EVIDENCE_REQUIRED", priority: "MEDIUM", summary: "The transaction classification requires supporting evidence.", explanation: `${transaction.transactionType} is configured to require evidence, but no associated evidence was found.`, triggeringValues: { transactionType: transaction.transactionType, evidenceCount: transaction.evidenceCount ?? 0 }, recommendedAction: "Attach a supporting document or change the classification with an auditable correction.", estimatedFeeImpact: 0 }));
  return results;
}

export function duplicateException(transaction: ReconciliationTransaction, count: number): ExceptionOutput {
  return exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "TXN003", type: "POTENTIAL_DUPLICATE", priority: "HIGH", summary: "VIN appears more than once in the same transaction context.", explanation: `${count} dealer transactions share VIN ${transaction.normalizedVin} in this dealership and reporting period.`, triggeringValues: { normalizedVin: transaction.normalizedVin, count }, recommendedAction: "Review source identifiers and exclude or correct duplicate entries without deleting the original import record.", estimatedFeeImpact: transaction.expectedFee });
}

export function missingTransactionException(registration: ReconciliationRegistrationRecord): ExceptionOutput {
  return exception({ transactionId: null, registrationRecordId: registration.id, vehicleId: registration.vehicleId, vin: registration.vin, normalizedVin: registration.normalizedVin, ruleId: "TXN001", type: "POSSIBLE_MISSING_TRANSACTION", priority: "HIGH", summary: "Registration record exists without a matching dealer transaction.", explanation: `Registration-style record dated ${registration.registrationDate} was found for VIN ${registration.normalizedVin}, but no corresponding dealer transaction exists in this reporting period.`, triggeringValues: { registrationDate: registration.registrationDate, eventType: registration.eventType }, recommendedAction: "Locate the dealer source record or document why the registration event is not reportable.", estimatedFeeImpact: 0 });
}

export function missingRegistrationException(transaction: ReconciliationTransaction): ExceptionOutput {
  return exception({ transactionId: transaction.id, registrationRecordId: null, vehicleId: transaction.vehicleId, vin: transaction.vin, normalizedVin: transaction.normalizedVin, ruleId: "TXN002", type: "UNMATCHED_DEALER_TRANSACTION", priority: "MEDIUM", summary: "Dealer transaction exists without a corresponding registration record.", explanation: `Dealer transaction dated ${transaction.transactionDate} for VIN ${transaction.normalizedVin} has no registration-style match in this reporting period.`, triggeringValues: { transactionDate: transaction.transactionDate, transactionType: transaction.transactionType }, recommendedAction: "Confirm the transaction status and registration timing or attach evidence for a valid exception.", estimatedFeeImpact: 0 });
}
