import { AuthorizationError } from "@/domain/auth/permissions";
import { HttpError } from "./http-error";

export function apiError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
  const status = error instanceof HttpError ? error.status : message === "Authentication required." ? 401 : error instanceof AuthorizationError ? 403 : message.includes("not found") ? 404 : 400;
  if (status >= 500) console.error(JSON.stringify({ level: "error", event: "api_failure", message }));
  return Response.json({ error: message }, { status, headers: error instanceof HttpError ? error.headers : undefined });
}
