import { describe, expect, it } from "vitest";
import { transactionRegisterAdapter } from "../imports/adapters";
import { previewCsv } from "../imports/pipeline";

describe("CSV import pipeline", () => {
  it("suggests aliases, normalizes values, and preserves raw input", () => {
    const csv = "Vehicle Identification Number,Date of sale,Fee paid,Transaction category\n2hg 000000000000rs,2025-05-10,$22.00,Used retail sale";
    const preview = previewCsv(csv, transactionRegisterAdapter);
    expect(preview.mapping.vin).toBe("Vehicle Identification Number"); expect(preview.records[0].normalizedRecord?.normalizedVin).toBe("2HG000000000000RS"); expect(preview.records[0].rawRecord["Fee paid"]).toBe("$22.00");
  });
  it("separates rejected records and duplicates", () => {
    const csv = "vin,transaction_date,transaction_type,record id\nSHORT,not-a-date,Retail,A\n2HG000000000000RS,2025-05-10,Retail,B\n2HG000000000000RS,2025-05-10,Retail,B";
    const preview = previewCsv(csv, transactionRegisterAdapter);
    expect(preview.summary.rejectedRows).toBe(1); expect(preview.summary.duplicateRows).toBe(1);
  });
  it("fails with an actionable missing-mapping error", () => expect(() => previewCsv("unknown\nvalue", transactionRegisterAdapter)).toThrow("Required columns are not mapped"));
});
