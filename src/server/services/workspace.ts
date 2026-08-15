import { and, desc, eq, sql } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import { db } from "@/server/db/client";
import { activityEvents, dealerships, exceptions, reconciliationRuns, reportingPeriods, transactions, vehicles } from "@/server/db/schema";

const statusLabels: Record<string, string> = { NEW: "New", UNDER_REVIEW: "Under review", AWAITING_DEALER: "Awaiting response", RESPONSE_RECEIVED: "Evidence received", REVIEWER_ACTION: "Under review", RESOLVED: "Resolved", ESCALATED: "Under review" };

export async function getWorkspace(actor: Actor, requestedDealershipId?: string) {
  const dealershipId = requestedDealershipId ?? (actor.role.startsWith("DEALER_") ? actor.dealershipId! : "dealer-1");
  assertCan(actor, "dealership:read", dealershipId);
  const [dealer] = await db.select().from(dealerships).where(eq(dealerships.id, dealershipId)).limit(1); if (!dealer) throw new Error("Dealership was not found.");
  const [period] = await db.select().from(reportingPeriods).where(eq(reportingPeriods.dealershipId, dealershipId)).orderBy(desc(reportingPeriods.startDate)).limit(1);
  const [latestRun] = period ? await db.select().from(reconciliationRuns).where(and(eq(reconciliationRuns.dealershipId, dealershipId), eq(reconciliationRuns.reportingPeriodId, period.id))).orderBy(desc(reconciliationRuns.startedAt)).limit(1) : [];
  const exceptionRows = latestRun ? await db.select().from(exceptions).where(eq(exceptions.reconciliationRunId, latestRun.id)).orderBy(desc(exceptions.estimatedFeeImpact), desc(exceptions.createdAt)) : [];
  const [transactionMetric] = period ? await db.select({ count: sql<number>`count(*)` }).from(transactions).where(and(eq(transactions.dealershipId, dealershipId), eq(transactions.reportingPeriodId, period.id))).limit(1) : [];
  const [feeMetric] = period ? await db.select({ total: sql<number>`coalesce(sum(${transactions.expectedFee}), 0)` }).from(transactions).where(and(eq(transactions.dealershipId, dealershipId), eq(transactions.reportingPeriodId, period.id))).limit(1) : [];
  const transactionCount = transactionMetric?.count ?? 0;
  const expectedFees = feeMetric?.total ?? 0;
  const openItems = exceptionRows.filter((item) => item.status !== "RESOLVED"); const matched = latestRun?.matchedCount ?? 0; const registrationCount = latestRun?.registrationRecordCount ?? 0;
  const recentActivity = await db.select().from(activityEvents).where(eq(activityEvents.dealershipId, dealershipId)).orderBy(desc(activityEvents.timestamp)).limit(20);
  const transactionRows = period ? await db.select({ transaction: transactions, vehicle: vehicles }).from(transactions).innerJoin(vehicles, eq(transactions.vehicleId, vehicles.id)).where(and(eq(transactions.dealershipId, dealershipId), eq(transactions.reportingPeriodId, period.id))).orderBy(desc(transactions.transactionDate)).limit(100) : [];
  return {
    actor, dealership: dealer, reportingPeriod: period, latestRun,
    metrics: { totalTransactions: Number(transactionCount), expectedFees: Number(expectedFees), matchRate: registrationCount ? Math.round((matched / Math.max(transactionCount, registrationCount)) * 1000) / 10 : 0, openExceptions: openItems.length, highPriorityExceptions: openItems.filter((item) => ["HIGH", "CRITICAL"].includes(item.priority)).length, unresolvedFeeImpact: openItems.reduce((sum, item) => sum + item.estimatedFeeImpact, 0) },
    exceptions: exceptionRows.map((item) => ({ id: item.id, transactionId: item.transactionId ?? "", vin: item.vin, dealerId: item.dealershipId, dealerName: dealer.tradeName, vehicle: transactionRows.find((row) => row.transaction.id === item.transactionId)?.vehicle ? `${transactionRows.find((row) => row.transaction.id === item.transactionId)!.vehicle.year ?? ""} ${transactionRows.find((row) => row.transaction.id === item.transactionId)!.vehicle.make ?? ""} ${transactionRows.find((row) => row.transaction.id === item.transactionId)!.vehicle.model ?? ""}`.trim() : "Vehicle record", type: item.summary, priority: item.priority === "CRITICAL" ? "high" : item.priority.toLowerCase(), status: statusLabels[item.status] ?? item.status, requirement: item.recommendedAction, reason: item.explanation, rule: item.ruleId, dueDate: item.dueDate ?? "Not set", feeImpact: item.estimatedFeeImpact, evidenceStatus: item.ruleId === "DOC001" ? "Missing" : "Review", explanation: item.resolutionReason ?? undefined, domainStatus: item.status })),
    transactions: transactionRows.map(({ transaction, vehicle }) => ({ ...transaction, vehicle: `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim(), stockNumber: vehicle.stockNumber })),
    activity: recentActivity,
  };
}
