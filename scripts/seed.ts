import { db, pool } from "../src/server/db/client";
import { audits, dealerships, feeSchedules, importBatches, organizations, reconciliationRules, registrationRecords, reportingPeriods, transactions, users, vehicles } from "../src/server/db/schema";
import { runReconciliation } from "../src/server/services/reconciliation";

const now = "2026-08-10T12:00:00.000Z";
const alphabet = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ";
function vin(index: number) {
  let value = index + 10_000;
  let suffix = "";
  while (value) { suffix = alphabet[value % alphabet.length] + suffix; value = Math.floor(value / alphabet.length); }
  return `2HG${suffix.padStart(14, "0")}`;
}
function chunks<T>(values: T[], size = 35): T[][] { return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size)); }

const [existingOrganization] = await db.select({ id: organizations.id }).from(organizations).limit(1);
if (existingOrganization) {
  console.log("Seed skipped: the database already contains product data.");
  process.exit(0);
}

await db.transaction(async (transaction) => {
  await transaction.insert(organizations).values([
    { id: "org-regulator", name: "Ontario Vehicle Transaction Review", type: "REGULATOR", status: "ACTIVE", createdAt: now, updatedAt: now },
    { id: "org-northfield-group", name: "Northfield Dealer Group", type: "DEALERSHIP_GROUP", status: "ACTIVE", createdAt: now, updatedAt: now },
    { id: "org-system", name: "Cordena Administration", type: "COMPLIANCE_FIRM", status: "ACTIVE", createdAt: now, updatedAt: now },
  ]);
  const dealerNames = ["Northfield Auto Group", "Mapleview Motors", "Lakeshore Auto Centre", "Capital City Ford", "Stonebridge Chevrolet", "Hillcrest Toyota", "Westgate Honda", "Durham Hyundai", "Georgian Bay Kia", "Yorkville Mazda", "Pine Ridge Ford", "Bayview Chrysler", "Kingston Auto Mall", "Niagara Import Centre", "Sudbury Motor Group", "Thunder Bay Auto", "Oakridge Motors", "Grand River Auto", "Scarborough Vehicle Centre", "Brampton North Motors", "Waterloo Auto House", "Guelph Motor Company", "Sarnia Auto Group", "Timmins Vehicle Centre", "Muskoka Motors"];
  await transaction.insert(dealerships).values(dealerNames.map((name, index) => ({ id: `dealer-${index + 1}`, organizationId: "org-northfield-group", legalName: `${name} Holdings Inc.`, tradeName: name, registrationNumber: `ON-${String(41023 + index * 97).padStart(6, "0")}`, address: `${100 + index} Main Street`, city: ["Hamilton", "Mississauga", "Toronto", "Ottawa", "London", "Kitchener"][index % 6], province: "ON", postalCode: "M5V 2T6", contactName: "Compliance Office", contactEmail: `compliance${index + 1}@example.test`, contactPhone: "416-555-0100", status: "ACTIVE", createdAt: now, updatedAt: now })));
  await transaction.insert(users).values([
    { id: "user-regulator", organizationId: "org-regulator", dealershipId: null, name: "Julia Mercer", email: "reviewer@example.test", emailVerifiedAt: now, role: "REGULATOR_REVIEWER", status: "ACTIVE", createdAt: now, updatedAt: now },
    { id: "user-dealer-admin", organizationId: "org-northfield-group", dealershipId: "dealer-1", name: "Jordan Smith", email: "dealer.admin@example.test", emailVerifiedAt: now, role: "DEALER_ADMIN", status: "ACTIVE", createdAt: now, updatedAt: now },
    { id: "user-dealer-compliance", organizationId: "org-northfield-group", dealershipId: "dealer-1", name: "Priya Shah", email: "dealer.user@example.test", emailVerifiedAt: now, role: "DEALER_USER", status: "ACTIVE", createdAt: now, updatedAt: now },
    { id: "user-system-admin", organizationId: "org-system", dealershipId: null, name: "System Administrator", email: "admin@example.test", emailVerifiedAt: now, role: "SYSTEM_ADMIN", status: "ACTIVE", createdAt: now, updatedAt: now },
  ]);
  await transaction.insert(reportingPeriods).values(dealerNames.map((_, index) => ({ id: `period-${index + 1}-2025`, dealershipId: `dealer-${index + 1}`, name: "2025 Annual Transaction Register", startDate: "2025-01-01", endDate: "2025-12-31", status: "OPEN", createdAt: now, closedAt: null })));
  await transaction.insert(feeSchedules).values({ id: "fee-on-2025", amount: 22, effectiveFrom: "2025-01-01", effectiveTo: null, jurisdiction: "ON", createdAt: now });
  const rules = [
    ["TXN001", "Possible missing transaction", "Registration exists without a dealer transaction", "HIGH", "MATCHING"], ["TXN002", "Unmatched dealer transaction", "Dealer transaction exists without registration", "MEDIUM", "MATCHING"], ["TXN003", "Potential duplicate", "VIN appears more than once", "HIGH", "DATA_QUALITY"], ["DATE001", "Date variance", "Dates exceed tolerance", "MEDIUM", "DATES"], ["TYPE001", "Classification discrepancy", "Classifications conflict", "MEDIUM", "CLASSIFICATION"], ["FEE001", "Missing fee", "Fee-required transaction contains no fee", "HIGH", "FINANCIAL"], ["FEE002", "Fee variance", "Reported fee differs from expected", "HIGH", "FINANCIAL"], ["DOC001", "Evidence required", "Classification requires evidence", "MEDIUM", "EVIDENCE"], ["VIN001", "Invalid VIN", "VIN fails validation", "HIGH", "DATA_QUALITY"], ["PERIOD001", "Reporting period discrepancy", "Date falls outside period", "MEDIUM", "DATES"],
  ];
  await transaction.insert(reconciliationRules).values(rules.map(([code, name, description, severity, category]) => ({ id: `rule-${code.toLowerCase()}`, code, name, description, severity, category, enabled: true, version: "ruleset-v1", configuration: code === "DATE001" ? JSON.stringify({ toleranceDays: 7 }) : "{}" })));
  await transaction.insert(importBatches).values({ id: "batch-seed-transactions", organizationId: "org-northfield-group", dealershipId: "dealer-1", reportingPeriodId: "period-1-2025", sourceType: "TRANSACTION_REGISTER", fileName: "northfield-2025-register.csv", status: "COMPLETED", totalRows: 2000, validRows: 2000, warningRows: 0, rejectedRows: 0, duplicateRows: 0, createdBy: "user-dealer-admin", createdAt: now, completedAt: now });

  const vehicleRows = Array.from({ length: 2015 }, (_, index) => ({ id: `vehicle-${index + 1}`, vin: vin(index), normalizedVin: vin(index), year: 2019 + (index % 7), make: ["Honda", "Ford", "Toyota", "Hyundai", "Chevrolet", "Mazda"][index % 6], model: ["Civic", "F-150", "RAV4", "Tucson", "Equinox", "CX-5"][index % 6], trim: index % 3 === 0 ? "EX" : null, stockNumber: `NF-${String(index + 1).padStart(5, "0")}`, createdAt: now, updatedAt: now }));
  for (const group of chunks(vehicleRows)) await transaction.insert(vehicles).values(group);
  const transactionRows = Array.from({ length: 2000 }, (_, index) => {
    const day = String((index % 27) + 1).padStart(2, "0"); const month = String((index % 12) + 1).padStart(2, "0"); const type = index % 29 === 0 ? "WHOLESALE" : index % 47 === 0 ? "CANCELLED" : "RETAIL"; const expectedFee = type === "RETAIL" ? 22 : 0;
    return { id: `transaction-${index + 1}`, dealershipId: "dealer-1", vehicleId: `vehicle-${index + 1}`, reportingPeriodId: "period-1-2025", vin: vin(index), normalizedVin: vin(index), transactionType: type, transactionDate: `2025-${month}-${day}`, deliveryDate: `2025-${month}-${day}`, transactionStatus: "ACTIVE", reportableStatus: type === "RETAIL" ? "REPORTABLE" : "EXEMPT_REVIEW", reconciliationState: "UNMATCHED", feeRequired: type === "RETAIL", expectedFee, reportedFee: index % 50 === 0 ? 0 : expectedFee, source: "DEALER_CSV", sourceRecordId: `seed-row-${index + 1}`, importBatchId: "batch-seed-transactions", originalValues: JSON.stringify({ vin: vin(index), transaction_type: type, transaction_date: `2025-${month}-${day}`, reported_fee: index % 50 === 0 ? 0 : expectedFee }), correctedValues: "{}", createdAt: now, updatedAt: now };
  });
  for (const group of chunks(transactionRows, 30)) await transaction.insert(transactions).values(group);
  const registrationRows = Array.from({ length: 2000 }, (_, index) => index % 40 === 0 ? null : { id: `registration-${index + 1}`, dealershipId: "dealer-1", vehicleId: `vehicle-${index + 1}`, reportingPeriodId: "period-1-2025", vin: vin(index), normalizedVin: vin(index), registrationDate: (() => { const base = new Date(`2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}T00:00:00Z`); base.setUTCDate(base.getUTCDate() + (index % 33 === 0 ? 14 : 2)); return base.toISOString().slice(0, 10); })(), eventType: "REGISTRATION", source: "AUTHORIZED_REGISTRATION_EXTRACT", sourceRecordId: `reg-seed-${index + 1}`, importBatchId: null, originalValues: JSON.stringify({ source: "seed" }), createdAt: now }).filter((row): row is NonNullable<typeof row> => Boolean(row));
  registrationRows.push(...Array.from({ length: 15 }, (_, offset) => ({ id: `registration-extra-${offset + 1}`, dealershipId: "dealer-1", vehicleId: `vehicle-${2001 + offset}`, reportingPeriodId: "period-1-2025", vin: vin(2000 + offset), normalizedVin: vin(2000 + offset), registrationDate: `2025-08-${String(offset + 1).padStart(2, "0")}`, eventType: "REGISTRATION", source: "AUTHORIZED_REGISTRATION_EXTRACT", sourceRecordId: `reg-extra-${offset + 1}`, importBatchId: null, originalValues: JSON.stringify({ source: "seed" }), createdAt: now })));
  for (const group of chunks(registrationRows, 35)) await transaction.insert(registrationRecords).values(group);
  await transaction.insert(audits).values({ id: "audit-northfield-2025", dealershipId: "dealer-1", reportingPeriodId: "period-1-2025", name: "Northfield 2025 transaction review", scope: "Annual transaction register reconciliation", status: "RECONCILIATION", assignedReviewer: "user-regulator", startedAt: "2026-08-01T13:00:00.000Z", dueAt: "2026-09-15T21:00:00.000Z", completedAt: null, createdAt: now, updatedAt: now });
});

const result = await runReconciliation({ dealershipId: "dealer-1", reportingPeriodId: "period-1-2025", actor: { id: "user-system-admin", organizationId: "org-system", dealershipId: null, role: "SYSTEM_ADMIN" } });
console.log(`Seeded 25 dealerships, 2,000 transactions, ${result.metrics.registrationRecordCount} registration records, and reconciliation run ${result.id}.`);
await pool.end();
