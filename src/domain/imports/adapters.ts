import { normalizeDate, normalizeMoney, normalizeStockNumber, normalizeTransactionType, validateVin } from "../normalization";
import type { ImportAdapter, NormalizedRegistrationImport, NormalizedTransactionImport } from "./types";

function value(raw: Record<string, string>, column?: string): string { return column ? raw[column] ?? "" : ""; }

export const transactionRegisterAdapter: ImportAdapter<NormalizedTransactionImport> = {
  sourceType: "TRANSACTION_REGISTER", requiredFields: ["vin", "transaction_date", "transaction_type"],
  normalize(raw, mapping, rowNumber) {
    const vin = validateVin(value(raw, mapping.vin)); const transactionDate = normalizeDate(value(raw, mapping.transaction_date)); const transactionType = normalizeTransactionType(value(raw, mapping.transaction_type)); const feeValue = value(raw, mapping.reported_fee); const reportedFee = feeValue ? normalizeMoney(feeValue) : 0;
    const errors = [...vin.errors]; const warnings: string[] = [];
    if (!transactionDate) errors.push("Transaction date is missing or invalid.");
    if (!transactionType) errors.push("Transaction type is missing or unsupported.");
    if (feeValue && reportedFee === null) errors.push("Reported fee is not a valid non-negative currency value.");
    if (!mapping.reported_fee) warnings.push("No reported fee column was mapped; fee defaults to zero and may create a review item.");
    const sourceRecordId = value(raw, mapping.source_record_id).trim() || `row-${rowNumber}`;
    return { rowNumber, rawRecord: raw, normalizedRecord: errors.length ? null : { vin: value(raw, mapping.vin), normalizedVin: vin.normalized, transactionDate: transactionDate!, transactionType: transactionType!, reportedFee: reportedFee ?? 0, sourceRecordId, stockNumber: normalizeStockNumber(value(raw, mapping.stock_number)) }, status: errors.length ? "REJECTED" : warnings.length ? "WARNING" : "VALID", warnings, errors };
  },
};

export const registrationRecordAdapter: ImportAdapter<NormalizedRegistrationImport> = {
  sourceType: "REGISTRATION_RECORD", requiredFields: ["vin", "registration_date"],
  normalize(raw, mapping, rowNumber) {
    const vin = validateVin(value(raw, mapping.vin)); const registrationDate = normalizeDate(value(raw, mapping.registration_date)); const errors = [...vin.errors]; const warnings: string[] = [];
    if (!registrationDate) errors.push("Registration date is missing or invalid.");
    if (!mapping.event_type) warnings.push("No event type column was mapped; the record is classified as REGISTRATION.");
    const sourceRecordId = value(raw, mapping.source_record_id).trim() || `row-${rowNumber}`;
    return { rowNumber, rawRecord: raw, normalizedRecord: errors.length ? null : { vin: value(raw, mapping.vin), normalizedVin: vin.normalized, registrationDate: registrationDate!, eventType: value(raw, mapping.event_type).trim().toUpperCase() || "REGISTRATION", sourceRecordId }, status: errors.length ? "REJECTED" : warnings.length ? "WARNING" : "VALID", warnings, errors };
  },
};
