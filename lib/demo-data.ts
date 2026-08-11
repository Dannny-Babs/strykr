export type Workspace = "dealer" | "regulator";
export type Status = "matched" | "warning" | "evidence" | "unresolved" | "exempt" | "resolved";
export type Priority = "high" | "medium" | "low";

export interface Dealer {
  id: string;
  name: string;
  legalName: string;
  registration: string;
  city: string;
  region: string;
  reported: number;
  detected: number;
  exceptions: number;
  variance: number;
  reconciliation: number;
  auditStatus: "In review" | "Submitted" | "Reviewed" | "Missing submission";
  attention: "High" | "Medium" | "Low";
  reviewer: string;
}

export interface Transaction {
  id: string;
  vin: string;
  vehicle: string;
  stock: string;
  dealerId: string;
  dealerName: string;
  type: string;
  reportedDate: string;
  registrationDate: string;
  expectedFee: number;
  reportedFee: number;
  status: Status;
  evidence: number;
  source: string;
}

export interface ExceptionRecord {
  id: string;
  transactionId: string;
  vin: string;
  dealerId: string;
  dealerName: string;
  vehicle: string;
  type: string;
  priority: Priority;
  status: "New" | "Under review" | "Awaiting response" | "Evidence received" | "Resolved";
  requirement: string;
  reason: string;
  rule: string;
  dueDate: string;
  feeImpact: number;
  evidenceStatus: string;
  explanation?: string;
  domainStatus?: string;
}

const dealerBlueprints = [
  ["Northfield Auto Group", "Hamilton", "Central", "In review", "High"],
  ["Mapleview Motors", "Mississauga", "GTA West", "In review", "High"],
  ["Lakeshore Auto Centre", "Toronto", "GTA", "In review", "High"],
  ["Capital City Ford", "Ottawa", "Eastern", "Submitted", "Medium"],
  ["Stonebridge Chevrolet", "London", "Southwest", "Submitted", "Medium"],
  ["Hillcrest Toyota", "Kitchener", "Central", "Submitted", "Medium"],
  ["Westgate Honda", "Windsor", "Southwest", "Reviewed", "Low"],
  ["Durham Hyundai", "Oshawa", "GTA East", "Reviewed", "Low"],
  ["Georgian Bay Kia", "Barrie", "Central", "Reviewed", "Low"],
  ["Yorkville Mazda", "Toronto", "GTA", "Reviewed", "Low"],
  ["Pine Ridge Ford", "Peterborough", "Eastern", "Missing submission", "High"],
  ["Bayview Chrysler", "Markham", "GTA", "Submitted", "Medium"],
  ["Kingston Auto Mall", "Kingston", "Eastern", "Reviewed", "Low"],
  ["Niagara Import Centre", "St. Catharines", "Niagara", "In review", "Medium"],
  ["Sudbury Motor Group", "Sudbury", "Northern", "Submitted", "Medium"],
  ["Thunder Bay Auto", "Thunder Bay", "Northern", "Reviewed", "Low"],
] as const;

export const dealers: Dealer[] = Array.from({ length: 32 }, (_, index) => {
  const source = dealerBlueprints[index % dealerBlueprints.length];
  const cycle = Math.floor(index / dealerBlueprints.length);
  const reported = index === 0 ? 1142 : 540 + ((index * 137) % 690);
  const exceptions = index === 0 ? 8 : (index * 7) % 31;
  const detected = index === 0 ? 1167 : reported + Math.max(0, exceptions - (index % 4));
  return {
    id: `dealer-${index + 1}`,
    name: cycle ? `${source[0]} ${cycle + 1}` : source[0],
    legalName: `${source[0]} Holdings Inc.`,
    registration: `ON-${String(41023 + index * 97).padStart(6, "0")}`,
    city: source[1],
    region: source[2],
    reported,
    detected,
    exceptions,
    variance: exceptions * 22,
    reconciliation: index === 0 ? 96.7 : Number((94.2 + ((index * 13) % 56) / 10).toFixed(1)),
    auditStatus: source[3],
    attention: source[4],
    reviewer: ["Julia Mercer", "Daniel Cho", "Amira Patel", "Ethan Wong"][index % 4],
  };
});

const vehicles = [
  "2021 Honda Civic EX",
  "2022 Ford F-150 XLT",
  "2020 Toyota RAV4 LE",
  "2023 Hyundai Tucson",
  "2019 Chevrolet Equinox",
  "2021 Mazda CX-5",
  "2022 Ram 1500",
  "2020 Kia Forte",
] as const;

const transactionTypes = ["Used retail sale", "Wholesale", "Lease", "As-is sale", "Fleet"] as const;
const statuses: Status[] = ["matched", "matched", "matched", "warning", "evidence", "unresolved", "exempt", "resolved"];

export const transactions: Transaction[] = Array.from({ length: 1200 }, (_, index) => {
  const dealer = dealers[index % dealers.length];
  const status = index < 3 ? "unresolved" : index < 8 ? "evidence" : statuses[index % statuses.length];
  const serial = String(100000 + index * 7919).slice(-6);
  const day = (index % 25) + 1;
  const expectedFee = status === "exempt" ? 0 : 22;
  return {
    id: `TXN-2025-${String(index + 1).padStart(5, "0")}`,
    vin: `2HGFC2F5${serial}H${String(704821 + index).slice(-6)}`,
    vehicle: vehicles[index % vehicles.length],
    stock: `NF-${25 + (index % 2)}-${String(index + 1478).padStart(5, "0")}`,
    dealerId: dealer.id,
    dealerName: dealer.name,
    type: transactionTypes[index % transactionTypes.length],
    reportedDate: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    registrationDate: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String(Math.min(day + (index % 3), 28)).padStart(2, "0")}`,
    expectedFee,
    reportedFee: status === "unresolved" ? 0 : expectedFee,
    status,
    evidence: status === "evidence" ? 0 : 2 + (index % 4),
    source: ["DMS import", "Fee register", "Registration-style record", "Accounting export"][index % 4],
  };
});

const exceptionTemplates = [
  ["Possible unreported transaction", "Register all sales", "No matching fee-register entry", "RC-001"],
  ["Missing sale date", "Accurate sale date", "Registration and reported dates differ", "RC-004"],
  ["Possible cancelled transaction", "Cancellation evidence", "Cancellation classification requires support", "RC-011"],
  ["Missing bill of sale", "Retain sale documents", "Required supporting document is absent", "RC-018"],
  ["Transaction date variance", "Accurate sale date", "Dates differ by more than seven days", "RC-007"],
  ["Classification mismatch", "Correct classification", "Dealer and registration classifications differ", "RC-009"],
] as const;

export const exceptions: ExceptionRecord[] = Array.from({ length: 148 }, (_, index) => {
  const transaction = transactions[index];
  const template = exceptionTemplates[index % exceptionTemplates.length];
  const dealer = index < 8 ? dealers[0] : dealers[index % dealers.length];
  const dueDay = Math.min(30, 5 + (index % 24));
  return {
    id: `EXC-2026-${String(index + 1).padStart(5, "0")}`,
    transactionId: transaction.id,
    vin: transaction.vin,
    dealerId: dealer.id,
    dealerName: dealer.name,
    vehicle: transaction.vehicle,
    type: template[0],
    priority: index < 3 || index % 11 === 0 ? "high" : index % 3 === 0 ? "low" : "medium",
    status: index < 3 ? "New" : index < 8 ? "Awaiting response" : index % 5 === 0 ? "Resolved" : "Under review",
    requirement: template[1],
    reason: template[2],
    rule: template[3],
    dueDate: `2026-08-${String(dueDay).padStart(2, "0")}`,
    feeImpact: index % 6 === 2 ? 0 : 22,
    evidenceStatus: index < 3 ? "Missing" : index < 8 ? "Requested" : index % 4 === 0 ? "Complete" : "Partial",
  };
});

export const activity = [
  { action: "Bill of sale uploaded", detail: "Transaction TXN-2025-01002", time: "Today, 8:58 AM", tone: "resolved" },
  { action: "Dealer explanation received", detail: "Wholesale transfer to registered dealer", time: "Today, 8:43 AM", tone: "info" },
  { action: "Fee register import completed", detail: "1,167 records processed", time: "Today, 7:45 AM", tone: "info" },
  { action: "Exception resolved", detail: "Cancellation evidence accepted", time: "Yesterday, 4:28 PM", tone: "resolved" },
] as const;

export const dashboardSummary = {
  readiness: 96.7,
  reported: 1142,
  detected: 1167,
  exact: 1128,
  warnings: 14,
  initialUnmatched: 25,
  validExempt: 11,
  corrected: 6,
  awaitingEvidence: 5,
  unresolved: 3,
  applicable: 1131,
  expectedFees: 24882,
};
