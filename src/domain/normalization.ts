import type { TransactionType } from "./enums";

const INVALID_VIN_CHARACTERS = /[IOQ]/;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizeVin(value: unknown): string {
  return String(value ?? "").toUpperCase().replace(/[\s-]+/g, "");
}

export function validateVin(value: unknown): { valid: boolean; normalized: string; errors: string[] } {
  const normalized = normalizeVin(value);
  const errors: string[] = [];
  if (normalized.length !== 17) errors.push("VIN must contain exactly 17 characters.");
  if (INVALID_VIN_CHARACTERS.test(normalized)) errors.push("VIN contains I, O, or Q, which are not valid VIN characters.");
  if (normalized && !VIN_PATTERN.test(normalized)) errors.push("VIN contains unsupported characters.");
  return { valid: errors.length === 0, normalized, errors };
}

export function normalizeDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(raw.includes("T") ? raw : `${raw}T12:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
}

export function normalizeMoney(value: unknown): number | null {
  const normalized = String(value ?? "").replace(/[$,\s]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : null;
}

export function normalizeTransactionType(value: unknown): TransactionType | null {
  const normalized = String(value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, TransactionType> = {
    SALE: "RETAIL", USED_RETAIL_SALE: "RETAIL", RETAIL_SALE: "RETAIL", RETAIL: "RETAIL",
    WHOLESALE: "WHOLESALE", DEALER_TO_DEALER: "WHOLESALE", LEASE: "LEASE", FLEET: "FLEET",
    EXPORT: "EXPORT", CANCELLED: "CANCELLED", CANCELED: "CANCELLED", OTHER: "OTHER",
  };
  return aliases[normalized] ?? null;
}

export function normalizeStockNumber(value: unknown): string | null {
  const normalized = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
  return normalized || null;
}

export function daysBetween(left: string, right: string): number {
  return Math.abs(new Date(`${left}T00:00:00Z`).valueOf() - new Date(`${right}T00:00:00Z`).valueOf()) / 86_400_000;
}
