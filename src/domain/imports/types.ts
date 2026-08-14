import type { ImportSourceType, TransactionType } from "../enums";

export type CanonicalField = "vin" | "transaction_date" | "transaction_type" | "reported_fee" | "source_record_id" | "stock_number" | "registration_date" | "event_type";
export type ColumnMapping = Partial<Record<CanonicalField, string>>;

export interface NormalizedTransactionImport {
  vin: string; normalizedVin: string; transactionDate: string; transactionType: TransactionType; reportedFee: number; sourceRecordId: string; stockNumber: string | null;
}
export interface NormalizedRegistrationImport {
  vin: string; normalizedVin: string; registrationDate: string; eventType: string; sourceRecordId: string;
}
export interface ValidatedImportRecord<T> { rowNumber: number; rawRecord: Record<string, string>; normalizedRecord: T | null; status: "VALID" | "WARNING" | "REJECTED" | "DUPLICATE"; warnings: string[]; errors: string[] }
export interface ImportPreview<T> { sourceType: ImportSourceType; headers: string[]; suggestedMapping: ColumnMapping; mapping: ColumnMapping; records: ValidatedImportRecord<T>[]; summary: { totalRows: number; validRows: number; warningRows: number; rejectedRows: number; duplicateRows: number } }

export interface ImportAdapter<T> {
  sourceType: ImportSourceType;
  requiredFields: CanonicalField[];
  normalize(raw: Record<string, string>, mapping: ColumnMapping, rowNumber: number): ValidatedImportRecord<T>;
}
