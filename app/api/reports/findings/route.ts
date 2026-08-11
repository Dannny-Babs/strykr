import { eq } from "drizzle-orm";
import { assertCan } from "@/domain/auth/permissions";
import { getActor } from "@/server/auth/context";
import { db } from "@/server/db/client";
import { auditFindings, audits, dealerships, exceptions } from "@/server/db/schema";
import { apiError } from "@/server/http/errors";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  try {
    const actor = await getActor(); assertCan(actor, "report:export"); const records = db.select({ finding: auditFindings, audit: audits, dealership: dealerships, exception: exceptions }).from(auditFindings).innerJoin(audits, eq(auditFindings.auditId, audits.id)).innerJoin(dealerships, eq(audits.dealershipId, dealerships.id)).innerJoin(exceptions, eq(auditFindings.exceptionId, exceptions.id)).all();
    const rows = [["Generated at", new Date().toISOString()], ["Scope", "Accessible reviewer portfolio"], ["Record count", records.length], [], ["Finding ID", "Audit", "Dealership", "Exception ID", "VIN", "Rule", "Classification", "Status", "Conclusion", "Fee impact", "Evidence IDs"], ...records.map(({ finding, audit, dealership, exception }) => [finding.id, audit.name, dealership.tradeName, exception.id, exception.normalizedVin, exception.ruleId, finding.type, finding.status, finding.conclusion, finding.feeImpact, finding.evidenceIds])];
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="dealersync-audit-findings.csv"' } });
  } catch (error) { return apiError(error); }
}
