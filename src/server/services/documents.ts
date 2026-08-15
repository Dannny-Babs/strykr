import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { assertCan, type Actor } from "@/domain/auth/permissions";
import { db } from "@/server/db/client";
import { dealerships, documents } from "@/server/db/schema";
import { documentStorage } from "@/server/storage";
import { scanDocument } from "@/server/security/document-scan";
import { recordActivity } from "./activity";

const allowedMimeTypes = new Set(["application/pdf", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"]);

export async function uploadDocument(input: { file: File; dealershipId: string; transactionId?: string; exceptionId?: string; documentType: string; actor: Actor }) {
  assertCan(input.actor, "evidence:create", input.dealershipId); if (input.file.size > 10 * 1024 * 1024) throw new Error("Documents must be 10 MB or smaller."); if (!allowedMimeTypes.has(input.file.type)) throw new Error(`Unsupported document MIME type: ${input.file.type || "unknown"}.`);
  const [dealer] = await db.select().from(dealerships).where(eq(dealerships.id, input.dealershipId)).limit(1); if (!dealer) throw new Error("Dealership was not found.");
  const bytes = new Uint8Array(await input.file.arrayBuffer()); const scan = await scanDocument(bytes, { fileName: input.file.name, mimeType: input.file.type });
  const id = randomUUID(); const stored = await documentStorage.put({ id, fileName: input.file.name, mimeType: input.file.type, bytes }); const now = new Date().toISOString();
  await db.transaction(async (transaction) => { await transaction.insert(documents).values({ id, dealershipId: input.dealershipId, transactionId: input.transactionId ?? null, exceptionId: input.exceptionId ?? null, fileName: input.file.name.replace(/[^a-zA-Z0-9 ._()-]/g, "_").slice(0, 160), documentType: input.documentType, storageReference: stored.reference, mimeType: input.file.type, fileSize: stored.size, contentSha256: scan.sha256, securityStatus: scan.status, securityDetails: JSON.stringify(scan.details), extractionStatus: "NOT_REQUESTED", extractedData: null, validationStatus: "PENDING", uploadedBy: input.actor.id, uploadedAt: now }); await recordActivity(transaction, { organizationId: dealer.organizationId, dealershipId: input.dealershipId, actorId: input.actor.id, entityType: "DOCUMENT", entityId: id, action: "EVIDENCE_UPLOADED", metadata: { fileName: input.file.name, documentType: input.documentType, transactionId: input.transactionId, exceptionId: input.exceptionId, contentSha256: scan.sha256, securityStatus: scan.status }, timestamp: now }); });
  return { id, fileName: input.file.name, documentType: input.documentType, size: stored.size, uploadedAt: now, validationStatus: "PENDING", securityStatus: scan.status };
}

export async function downloadDocument(id: string, actor: Actor) {
  const [item] = await db.select().from(documents).where(eq(documents.id, id)).limit(1); if (!item) throw new Error("Document was not found."); assertCan(actor, "exception:read", item.dealershipId); if (item.securityStatus !== "PASSED") throw new Error("Document download is blocked pending a clean security scan."); return { item, bytes: await documentStorage.get(item.storageReference) };
}
