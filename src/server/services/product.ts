import "server-only";

import { desc, eq, ne } from "drizzle-orm";
import type { SessionUser } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { audits, dealerships, documents, exceptions, importBatches, reconciliationRuns } from "@/server/db/schema";
import { getWorkspace } from "./workspace";

const asActor = (actor: SessionUser) => ({ id: actor.id, organizationId: actor.organizationId, dealershipId: actor.dealershipId, role: actor.role });

export function getDealerProductData(actor: SessionUser) {
  if (!actor.dealershipId) throw new Error("Dealer account is not connected to a dealership.");
  const workspace = getWorkspace(asActor(actor), actor.dealershipId);
  const imports = db.select().from(importBatches).where(eq(importBatches.dealershipId, actor.dealershipId)).orderBy(desc(importBatches.createdAt)).limit(30).all();
  const documentRows = db.select().from(documents).where(eq(documents.dealershipId, actor.dealershipId)).orderBy(desc(documents.uploadedAt)).limit(30).all();
  return { ...workspace, imports, documents: documentRows };
}

export function getReviewerProductData() {
  const dealerRows = db.select().from(dealerships).orderBy(dealerships.tradeName).all();
  const openExceptions = db.select().from(exceptions).where(ne(exceptions.status, "RESOLVED")).orderBy(desc(exceptions.estimatedFeeImpact), desc(exceptions.createdAt)).limit(200).all();
  const auditRows = db.select({ audit: audits, dealership: dealerships }).from(audits).innerJoin(dealerships, eq(audits.dealershipId, dealerships.id)).orderBy(desc(audits.createdAt)).all();
  const latestRuns = db.select().from(reconciliationRuns).orderBy(desc(reconciliationRuns.startedAt)).all();
  const dealerSummaries = dealerRows.map((dealer) => {
    const dealerExceptions = openExceptions.filter((item) => item.dealershipId === dealer.id);
    const run = latestRuns.find((item) => item.dealershipId === dealer.id);
    return { ...dealer, openExceptions: dealerExceptions.length, highPriority: dealerExceptions.filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length, estimatedFeeImpact: dealerExceptions.reduce((sum, item) => sum + item.estimatedFeeImpact, 0), matchRate: run && Math.max(run.transactionCount, run.registrationRecordCount) ? Math.round((run.matchedCount / Math.max(run.transactionCount, run.registrationRecordCount)) * 1000) / 10 : null, lastRunAt: run?.completedAt ?? null };
  });
  return { dealerships: dealerSummaries, exceptions: openExceptions, audits: auditRows, metrics: { dealerships: dealerRows.length, openExceptions: openExceptions.length, highPriority: openExceptions.filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length, responsesReceived: openExceptions.filter((item) => item.status === "RESPONSE_RECEIVED").length, estimatedFeeImpact: openExceptions.reduce((sum, item) => sum + item.estimatedFeeImpact, 0), activeAudits: auditRows.filter(({ audit }) => !["COMPLETE", "CLOSED"].includes(audit.status)).length } };
}

export function getDealerContext(dealershipId: string) {
  return db.select().from(dealerships).where(eq(dealerships.id, dealershipId)).get();
}
