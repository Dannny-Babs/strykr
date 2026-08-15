import "server-only";

import { blobDocumentStorage } from "./blob";
import { localDocumentStorage } from "./local";

const hasBlobCredentials = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);

if (process.env.NODE_ENV === "production" && !hasBlobCredentials) {
  throw new Error("Private document storage is not configured.");
}

export const documentStorage = hasBlobCredentials ? blobDocumentStorage : localDocumentStorage;
