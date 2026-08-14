import type { CanonicalField, ColumnMapping } from "./types";

const aliases: Record<CanonicalField, string[]> = {
  vin: ["vin", "vin number", "vehicle vin", "vehicle identification number", "vehicle_vin", "normalized vin"],
  transaction_date: ["transaction date", "sale date", "date of sale", "sold date", "delivery date", "transaction_date"],
  transaction_type: ["transaction type", "sale type", "category", "transaction category", "transaction_type"],
  reported_fee: ["reported fee", "fee", "fee paid", "transaction fee", "omvic fee", "reported_fee"],
  source_record_id: ["source record id", "record id", "transaction id", "reference", "source_record_id"],
  stock_number: ["stock number", "stock no", "stock #", "stock_number"],
  registration_date: ["registration date", "registered date", "event date", "registration_date"],
  event_type: ["event type", "registration type", "record type", "event_type"],
};

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

export function suggestColumnMapping(headers: string[]): ColumnMapping {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]));
  return Object.fromEntries(Object.entries(aliases).flatMap(([field, values]) => {
    const match = values.map(normalizeHeader).map((alias) => normalizedHeaders.get(alias)).find(Boolean);
    return match ? [[field, match]] : [];
  })) as ColumnMapping;
}

export function missingRequiredMappings(mapping: ColumnMapping, requiredFields: CanonicalField[]): CanonicalField[] {
  return requiredFields.filter((field) => !mapping[field]);
}
