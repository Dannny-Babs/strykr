import "server-only";

import { and, eq, like, or } from "drizzle-orm";
import type { SessionUser } from "@/server/auth/types";
import { db } from "@/server/db/client";
import { audits, dealerships, documents, exceptions, importBatches, transactions } from "@/server/db/schema";
import { normalizeGlobalSearchQuery, type GlobalSearchResult } from "@/product/search";

export async function searchAuthorizedRecords(actor: SessionUser, rawQuery: string): Promise<GlobalSearchResult[]> {
  const query = normalizeGlobalSearchQuery(rawQuery);
  if (query.length < 2) return [];
  const pattern = `%${query.toUpperCase()}%`; const dealershipScope = actor.dealershipId ? eq(dealerships.id, actor.dealershipId) : undefined;
  const results: GlobalSearchResult[] = [];
  const dealerRows = await db.select().from(dealerships).where(and(dealershipScope, or(like(dealerships.tradeName, pattern), like(dealerships.registrationNumber, pattern)))).limit(4);
  for (const row of dealerRows) results.push({ type: "dealership", id: row.id, primaryLabel: row.tradeName, secondaryLabel: row.registrationNumber, status: row.status });
  const transactionRows = await db.select().from(transactions).where(and(actor.dealershipId ? eq(transactions.dealershipId, actor.dealershipId) : undefined, like(transactions.normalizedVin, pattern))).limit(4);
  for (const row of transactionRows) results.push({ type: "transaction", id: row.id, primaryLabel: row.normalizedVin, secondaryLabel: `${row.transactionType} · ${row.transactionDate}`, status: row.reconciliationState });
  const exceptionRows = await db.select().from(exceptions).where(and(actor.dealershipId ? eq(exceptions.dealershipId, actor.dealershipId) : undefined, or(like(exceptions.id, pattern), like(exceptions.normalizedVin, pattern), like(exceptions.ruleId, pattern), like(exceptions.summary, pattern)))).limit(5);
  for (const row of exceptionRows) results.push({ type: "exception", id: row.id, primaryLabel: row.summary, secondaryLabel: `${row.ruleId} · ${row.normalizedVin}`, status: row.status });
  const auditRows = await db.select().from(audits).where(and(actor.dealershipId ? eq(audits.dealershipId, actor.dealershipId) : undefined, like(audits.name, pattern))).limit(3);
  for (const row of auditRows) results.push({ type: "audit", id: row.id, primaryLabel: row.name, secondaryLabel: row.scope, status: row.status });
  const documentRows = await db.select().from(documents).where(and(actor.dealershipId ? eq(documents.dealershipId, actor.dealershipId) : undefined, like(documents.fileName, pattern))).limit(3);
  for (const row of documentRows) results.push({ type: "document", id: row.id, primaryLabel: row.fileName, secondaryLabel: row.documentType, status: row.validationStatus });
  const importRows = await db.select().from(importBatches).where(and(actor.dealershipId ? eq(importBatches.dealershipId, actor.dealershipId) : undefined, like(importBatches.fileName, pattern))).limit(3);
  for (const row of importRows) results.push({ type: "import", id: row.id, primaryLabel: row.fileName, secondaryLabel: row.sourceType, status: row.status });
  return results.slice(0, 12);
}
