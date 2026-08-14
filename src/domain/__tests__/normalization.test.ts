import { describe, expect, it } from "vitest";
import { normalizeDate, normalizeMoney, normalizeTransactionType, normalizeVin, validateVin } from "../normalization";

describe("normalization", () => {
  it("normalizes VIN casing, spaces, and hyphens deterministically", () => expect(normalizeVin(" 2hg-000000000000rs ")).toBe("2HG000000000000RS"));
  it("rejects VIN length and uncertain invalid characters without fixing them", () => { expect(validateVin("2HG0000000000000I").valid).toBe(false); expect(validateVin("SHORT").errors).toContain("VIN must contain exactly 17 characters."); });
  it("normalizes dates, money, and transaction type aliases", () => { expect(normalizeDate("2025-02-18")).toBe("2025-02-18"); expect(normalizeMoney("$1,022.40")).toBe(1022.4); expect(normalizeTransactionType("dealer-to-dealer")).toBe("WHOLESALE"); });
});
