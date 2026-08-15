import "server-only";

import { get, put } from "@vercel/blob";
import { Buffer } from "node:buffer";
import { basename } from "node:path";
import type { DocumentStorage } from "./types";

const safeName = (value: string) => basename(value).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document";

export const blobDocumentStorage: DocumentStorage = {
  async put({ id, fileName, mimeType, bytes }) {
    const blob = await put(`evidence/${id}-${safeName(fileName)}`, Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      contentType: mimeType,
    });
    return { reference: blob.url, size: bytes.byteLength };
  },
  async get(reference) {
    const result = await get(reference, { access: "private" });
    if (!result || result.statusCode !== 200) throw new Error("Stored document was not found.");
    return new Uint8Array(await new Response(result.stream).arrayBuffer());
  },
};
