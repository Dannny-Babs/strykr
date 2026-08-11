import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import type { DocumentStorage } from "./types";

const storageRoot = resolve(process.cwd(), process.env.DOCUMENT_STORAGE_PATH ?? "./storage/documents");
const safeName = (value: string) => basename(value).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";

export const localDocumentStorage: DocumentStorage = {
  async put({ id, fileName, bytes }) { await mkdir(storageRoot, { recursive: true }); const reference = `${id}-${safeName(fileName)}`; await writeFile(resolve(storageRoot, reference), bytes, { flag: "wx" }); return { reference, size: bytes.byteLength }; },
  async get(reference) { const safeReference = basename(reference); if (safeReference !== reference) throw new Error("Invalid document storage reference."); return readFile(resolve(storageRoot, safeReference)); },
};
