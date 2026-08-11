import { describe, expect, it } from "vitest";
import {
  aggregateMonthlyValues,
  buildReadinessBuckets,
  normalizeSelectedIds,
  parseDatasetSort,
  reconciliationOutcomeCategories,
} from "@/domain/product/ui-system";

describe("product UI data contracts", () => {
  it("builds deterministic month keys and preserves verified zeroes", () => {
    expect(aggregateMonthlyValues([
      { date: "2026-03-12", value: 2 },
      { date: "2026-01-20", value: 3 },
      { date: "2026-01-03", value: 4 },
    ], "2026-01-01", "2026-03-31")).toEqual([
      { key: "2026-01", label: "Jan", value: 7 },
      { key: "2026-02", label: "Feb", value: 0 },
      { key: "2026-03", label: "Mar", value: 2 },
    ]);
  });

  it("handles empty and out-of-period monthly data", () => {
    expect(aggregateMonthlyValues([], "2026-01-01", "2026-02-28")).toEqual([
      { key: "2026-01", label: "Jan", value: 0 },
      { key: "2026-02", label: "Feb", value: 0 },
    ]);
    expect(aggregateMonthlyValues([{ date: "2025-12-31", value: 9 }], "2026-01-01", "2026-01-31")[0].value).toBe(0);
  });

  it("places readiness values on the locked 75 and 90 boundaries", () => {
    expect(buildReadinessBuckets([90, 89.9, 75, 74.9, null])).toEqual([
      { key: "ready", label: "90–100%", value: 1 },
      { key: "review", label: "75–89.9%", value: 2 },
      { key: "attention", label: "Below 75%", value: 1 },
      { key: "no-run", label: "No reconciliation run", value: 1 },
    ]);
  });

  it("derives reconciliation outcomes without inventing totals", () => {
    expect(reconciliationOutcomeCategories({ matched: 84, warnings: 11, exceptions: 5 })).toEqual([
      { key: "matched", label: "Matched", value: 84 },
      { key: "warning", label: "Warnings", value: 11 },
      { key: "exception", label: "Exceptions", value: 5 },
    ]);
  });

  it("parses supported sorts and falls back on invalid input", () => {
    expect(parseDatasetSort("reviewerExceptions", "newest")).toBe("newest");
    expect(parseDatasetSort("reviewerExceptions", "not-a-sort")).toBe("impact-desc");
    expect(parseDatasetSort("dealerTransactions", null)).toBe("date-desc");
  });

  it("normalizes page-scoped selected exports without leaking duplicates", () => {
    expect(normalizeSelectedIds([" tx-2 ", "tx-1", "tx-2"], 50)).toEqual(["tx-1", "tx-2"]);
    expect(() => normalizeSelectedIds([], 50)).toThrow(/at least one/i);
    expect(() => normalizeSelectedIds(Array.from({ length: 51 }, (_, index) => `id-${index}`), 50)).toThrow(/50/);
  });
});
