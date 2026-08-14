import { z } from "zod";

export const pythonExtractionContract = z.object({
  schemaVersion: z.literal("cordena-extraction-v1"),
  generatedAt: z.iso.datetime(),
  source: z.object({ name: z.string().min(1), reference: z.string().min(1), extractionMethod: z.string().min(1) }),
  records: z.array(z.object({ sourceRecordId: z.string().min(1), vin: z.string(), observedAt: z.iso.datetime().or(z.iso.date()), recordType: z.enum(["TRANSACTION", "REGISTRATION", "LISTING_OBSERVATION", "DOCUMENT_EVIDENCE"]), fields: z.record(z.string(), z.unknown()), confidence: z.number().min(0).max(1).optional(), sourceUrl: z.url().optional() })),
});
export type PythonExtraction = z.infer<typeof pythonExtractionContract>;
