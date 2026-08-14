import { parse } from "csv-parse/sync";
import { missingRequiredMappings, suggestColumnMapping } from "./column-mapping";
import type { ColumnMapping, ImportAdapter, ImportPreview } from "./types";

export function previewCsv<T>(csv: string, adapter: ImportAdapter<T>, manualMapping: ColumnMapping = {}): ImportPreview<T> {
  const rows = parse(csv, { bom: true, columns: true, skip_empty_lines: true, trim: true, relax_column_count: false }) as Record<string, string>[];
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const suggestedMapping = suggestColumnMapping(headers); const mapping = { ...suggestedMapping, ...manualMapping };
  const missing = missingRequiredMappings(mapping, adapter.requiredFields);
  if (missing.length) throw new Error(`Required columns are not mapped: ${missing.join(", ")}.`);
  const seen = new Set<string>();
  const records = rows.map((row, index) => {
    const record = adapter.normalize(row, mapping, index + 2); const normalized = record.normalizedRecord as { normalizedVin?: string; sourceRecordId?: string } | null;
    if (normalized) { const key = `${normalized.normalizedVin}:${normalized.sourceRecordId}`; if (seen.has(key)) return { ...record, status: "DUPLICATE" as const, warnings: [...record.warnings, "Duplicate VIN and source identifier in this file."] }; seen.add(key); }
    return record;
  });
  return { sourceType: adapter.sourceType, headers, suggestedMapping, mapping, records, summary: { totalRows: records.length, validRows: records.filter((row) => row.status === "VALID").length, warningRows: records.filter((row) => row.status === "WARNING").length, rejectedRows: records.filter((row) => row.status === "REJECTED").length, duplicateRows: records.filter((row) => row.status === "DUPLICATE").length } };
}
