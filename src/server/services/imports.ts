import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import { feeForDate } from "@/domain/fees";
import { transactionRegisterAdapter, registrationRecordAdapter } from "@/domain/imports/adapters";
import { previewCsv } from "@/domain/imports/pipeline";
import type { ColumnMapping, NormalizedRegistrationImport, NormalizedTransactionImport } from "@/domain/imports/types";
import { db } from "@/server/db/client";
import { dealerships, feeSchedules, importBatches, importRecords, registrationRecords, reportingPeriods, transactions, vehicles } from "@/server/db/schema";
import { recordActivity } from "./activity";

export function previewImport(input: { sourceType: "TRANSACTION_REGISTER" | "REGISTRATION_RECORD"; csv: string; mapping?: ColumnMapping }) {
  return input.sourceType === "TRANSACTION_REGISTER" ? previewCsv(input.csv, transactionRegisterAdapter, input.mapping) : previewCsv(input.csv, registrationRecordAdapter, input.mapping);
}

export function commitImport(input: { sourceType: "TRANSACTION_REGISTER" | "REGISTRATION_RECORD"; csv: string; mapping?: ColumnMapping; fileName: string; dealershipId: string; reportingPeriodId: string; actor: Actor }) {
  assertCan(input.actor, "import:create", input.dealershipId);
  const dealer = db.select().from(dealerships).where(eq(dealerships.id, input.dealershipId)).get();
  const period = db.select().from(reportingPeriods).where(and(eq(reportingPeriods.id, input.reportingPeriodId), eq(reportingPeriods.dealershipId, input.dealershipId))).get();
  if (!dealer || !period) throw new Error("Dealership or reporting period was not found.");
  const preview = previewImport(input);
  const batchId = randomUUID(); const now = new Date().toISOString();
  const schedules = db.select().from(feeSchedules).all();
  db.transaction((transaction) => {
    transaction.insert(importBatches).values({ id: batchId, organizationId: dealer.organizationId, dealershipId: input.dealershipId, reportingPeriodId: input.reportingPeriodId, sourceType: input.sourceType, fileName: input.fileName, status: "COMPLETED", ...preview.summary, createdBy: input.actor.id, createdAt: now, completedAt: now }).run();
    for (const record of preview.records) {
      transaction.insert(importRecords).values({ id: randomUUID(), batchId, rowNumber: record.rowNumber, rawRecord: JSON.stringify(record.rawRecord), normalizedRecord: record.normalizedRecord ? JSON.stringify(record.normalizedRecord) : null, status: record.status, warnings: JSON.stringify(record.warnings), errors: JSON.stringify(record.errors), createdAt: now }).run();
      if (!record.normalizedRecord || record.status === "REJECTED" || record.status === "DUPLICATE") continue;
      const normalized = record.normalizedRecord as NormalizedTransactionImport | NormalizedRegistrationImport;
      let vehicle = transaction.select().from(vehicles).where(eq(vehicles.normalizedVin, normalized.normalizedVin)).get();
      if (!vehicle) { const vehicleId = randomUUID(); transaction.insert(vehicles).values({ id: vehicleId, vin: normalized.vin, normalizedVin: normalized.normalizedVin, year: null, make: null, model: null, trim: null, stockNumber: "stockNumber" in normalized ? normalized.stockNumber : null, createdAt: now, updatedAt: now }).run(); vehicle = transaction.select().from(vehicles).where(eq(vehicles.id, vehicleId)).get()!; }
      if (input.sourceType === "TRANSACTION_REGISTER") {
        const item = normalized as NormalizedTransactionImport; const feeRequired = item.transactionType === "RETAIL"; const expectedFee = feeRequired ? feeForDate(item.transactionDate, schedules) : 0;
        transaction.insert(transactions).values({ id: randomUUID(), dealershipId: input.dealershipId, vehicleId: vehicle.id, reportingPeriodId: input.reportingPeriodId, vin: item.vin, normalizedVin: item.normalizedVin, transactionType: item.transactionType, transactionDate: item.transactionDate, deliveryDate: null, transactionStatus: "ACTIVE", reportableStatus: feeRequired ? "REPORTABLE" : "EXEMPT_REVIEW", reconciliationState: "UNMATCHED", feeRequired, expectedFee, reportedFee: item.reportedFee, source: "DEALER_CSV", sourceRecordId: item.sourceRecordId, importBatchId: batchId, originalValues: JSON.stringify(record.rawRecord), correctedValues: "{}", createdAt: now, updatedAt: now }).run();
      } else {
        const item = normalized as NormalizedRegistrationImport;
        transaction.insert(registrationRecords).values({ id: randomUUID(), dealershipId: input.dealershipId, vehicleId: vehicle.id, reportingPeriodId: input.reportingPeriodId, vin: item.vin, normalizedVin: item.normalizedVin, registrationDate: item.registrationDate, eventType: item.eventType, source: "AUTHORIZED_REGISTRATION_EXTRACT", sourceRecordId: item.sourceRecordId, importBatchId: batchId, originalValues: JSON.stringify(record.rawRecord), createdAt: now }).run();
      }
    }
    recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: input.dealershipId, actorId: input.actor.id, entityType: "IMPORT_BATCH", entityId: batchId, action: "IMPORT_COMPLETED", metadata: { sourceType: input.sourceType, fileName: input.fileName, summary: preview.summary }, timestamp: now });
  });
  return { id: batchId, ...preview.summary };
}
