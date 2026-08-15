import "server-only";

import { createHash } from "node:crypto";
import { HttpError } from "@/server/http/http-error";

const startsWith = (bytes: Uint8Array, signature: number[]) => signature.every((value, index) => bytes[index] === value);
const ascii = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");

function inspectSignature(bytes: Uint8Array, mimeType: string) {
  const content = ascii(bytes);
  if (content.includes("EICAR-STANDARD-ANTIVIRUS-TEST-FILE")) throw new HttpError("The document failed the security scan.", 422);
  if (startsWith(bytes, [0x4d, 0x5a]) || startsWith(bytes, [0x7f, 0x45, 0x4c, 0x46]) || startsWith(bytes, [0xcf, 0xfa, 0xed, 0xfe]) || startsWith(bytes, [0xca, 0xfe, 0xba, 0xbe])) throw new HttpError("Executable files cannot be uploaded as evidence.", 422);
  if (mimeType === "application/pdf" && !content.startsWith("%PDF-")) throw new HttpError("The file contents do not match the declared PDF type.", 422);
  if (mimeType === "image/png" && !startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) throw new HttpError("The file contents do not match the declared PNG type.", 422);
  if (mimeType === "image/jpeg" && !startsWith(bytes, [0xff, 0xd8, 0xff])) throw new HttpError("The file contents do not match the declared JPEG type.", 422);
  if (mimeType.includes("openxmlformats") && !startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) throw new HttpError("The file contents do not match the declared Office document type.", 422);
  if (mimeType.includes("openxmlformats") && content.toLowerCase().includes("vbaproject.bin")) throw new HttpError("Macro-enabled Office documents cannot be uploaded as evidence.", 422);
  if (mimeType === "text/csv") {
    if (bytes.includes(0)) throw new HttpError("CSV evidence must be plain text.", 422);
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new HttpError("CSV evidence must use valid UTF-8 text.", 422); }
  }
}

async function inspectWithRemoteScanner(bytes: Uint8Array, input: { fileName: string; mimeType: string }) {
  const url = process.env.MALWARE_SCAN_URL;
  if (!url) {
    if (process.env.MALWARE_SCAN_REQUIRED === "true") throw new HttpError("Evidence scanning is temporarily unavailable.", 503);
    return { engine: "cordena-signature-v1", verdict: "clean" };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": input.mimeType, "x-file-name": encodeURIComponent(input.fileName), ...(process.env.MALWARE_SCAN_API_TOKEN ? { authorization: `Bearer ${process.env.MALWARE_SCAN_API_TOKEN}` } : {}) },
    body: Buffer.from(bytes),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new HttpError("Evidence scanning is temporarily unavailable.", 503);
  const result = await response.json() as { safe?: boolean; engine?: string; signature?: string };
  if (result.safe !== true) throw new HttpError("The document failed the security scan.", 422);
  return { engine: result.engine || "remote-scanner", verdict: "clean", signature: result.signature };
}

export async function scanDocument(bytes: Uint8Array, input: { fileName: string; mimeType: string }) {
  inspectSignature(bytes, input.mimeType);
  const remote = await inspectWithRemoteScanner(bytes, input);
  return { sha256: createHash("sha256").update(bytes).digest("hex"), status: "PASSED", details: remote };
}
