export type TimeSeriesDatum = { key: string; label: string; value: number | null };
export type CategoryDatum = { key: string; label: string; value: number };

const DATASET_SORTS = {
  reviewerExceptions: { values: ["impact-desc", "newest", "oldest", "priority-desc"], fallback: "impact-desc" },
  reviewerDealerships: { values: ["attention", "name-asc", "match-desc"], fallback: "attention" },
  reviewerAudits: { values: ["newest", "due-soonest", "status"], fallback: "newest" },
  dealerTransactions: { values: ["date-desc", "date-asc", "vin-asc"], fallback: "date-desc" },
  dealerExceptions: { values: ["impact-desc", "newest", "priority-desc"], fallback: "impact-desc" },
} as const;

export type DatasetName = keyof typeof DATASET_SORTS;

export function parseDatasetSort<T extends DatasetName>(dataset: T, value: string | null | undefined) {
  const contract = DATASET_SORTS[dataset];
  return contract.values.includes(value as never) ? value as (typeof contract.values)[number] : contract.fallback;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function aggregateMonthlyValues(rows: Array<{ date: string | Date; value?: number }>, start: string | Date, end: string | Date): TimeSeriesDatum[] {
  const cursor = new Date(start); const finish = new Date(end);
  cursor.setUTCDate(1); finish.setUTCDate(1);
  if (!Number.isFinite(cursor.getTime()) || !Number.isFinite(finish.getTime()) || cursor > finish) return [];
  const totals = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(row.date); if (!Number.isFinite(date.getTime())) continue;
    const key = monthKey(date); totals.set(key, (totals.get(key) ?? 0) + (row.value ?? 1));
  }
  const output: TimeSeriesDatum[] = [];
  while (cursor <= finish) {
    const key = monthKey(cursor);
    output.push({ key, label: new Intl.DateTimeFormat("en-CA", { month: "short", timeZone: "UTC" }).format(cursor), value: totals.get(key) ?? 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return output;
}

export function buildReadinessBuckets(values: Array<number | null>): CategoryDatum[] {
  const buckets = { ready: 0, review: 0, attention: 0, "no-run": 0 };
  for (const value of values) {
    if (value === null || !Number.isFinite(value)) buckets["no-run"] += 1;
    else if (value >= 90) buckets.ready += 1;
    else if (value >= 75) buckets.review += 1;
    else buckets.attention += 1;
  }
  return [
    { key: "ready", label: "90–100%", value: buckets.ready },
    { key: "review", label: "75–89.9%", value: buckets.review },
    { key: "attention", label: "Below 75%", value: buckets.attention },
    { key: "no-run", label: "No reconciliation run", value: buckets["no-run"] },
  ];
}

export function reconciliationOutcomeCategories(input: { matched: number; warnings: number; exceptions: number }): CategoryDatum[] {
  return [
    { key: "matched", label: "Matched", value: input.matched },
    { key: "warning", label: "Warnings", value: input.warnings },
    { key: "exception", label: "Exceptions", value: input.exceptions },
  ];
}

export function normalizeSelectedIds(ids: string[], maximum = 50) {
  const normalized = [...new Set(ids.map((id) => id.trim()).filter(Boolean))].sort();
  if (!normalized.length) throw new Error("Select at least one record to export.");
  if (normalized.length > maximum) throw new Error(`A maximum of ${maximum} records can be exported at once.`);
  return normalized;
}
