import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { scanDocument } from "../document-scan";

describe("document security scan", () => {
  it("fingerprints a structurally valid PDF", async () => {
    const result = await scanDocument(new TextEncoder().encode("%PDF-1.7\nclean evidence"), { fileName: "evidence.pdf", mimeType: "application/pdf" });
    expect(result.status).toBe("PASSED");
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects declared types that do not match the bytes", async () => {
    await expect(scanDocument(new TextEncoder().encode("not a pdf"), { fileName: "evidence.pdf", mimeType: "application/pdf" })).rejects.toThrow("do not match");
  });

  it("rejects the standard antivirus test signature", async () => {
    const bytes = new TextEncoder().encode("%PDF-1.7 EICAR-STANDARD-ANTIVIRUS-TEST-FILE");
    await expect(scanDocument(bytes, { fileName: "test.pdf", mimeType: "application/pdf" })).rejects.toThrow("failed the security scan");
  });
});
