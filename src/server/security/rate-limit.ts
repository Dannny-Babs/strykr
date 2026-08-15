import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { HttpError } from "@/server/http/http-error";

const identifierFor = (request: Request, discriminator = "") => {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${address}:${discriminator.trim().toLowerCase()}`).digest("hex");
};

export async function enforceRateLimit(request: Request, input: { scope: string; limit: number; windowMs: number; discriminator?: string }) {
  const now = new Date();
  const nextReset = new Date(now.valueOf() + input.windowMs);
  const key = `${input.scope}:${identifierFor(request, input.discriminator)}`;
  const result = await db.execute(sql`
    INSERT INTO rate_limit_buckets (key, count, reset_at, updated_at)
    VALUES (${key}, 1, ${nextReset.toISOString()}, ${now.toISOString()})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limit_buckets.reset_at <= ${now.toISOString()} THEN 1 ELSE rate_limit_buckets.count + 1 END,
      reset_at = CASE WHEN rate_limit_buckets.reset_at <= ${now.toISOString()} THEN ${nextReset.toISOString()} ELSE rate_limit_buckets.reset_at END,
      updated_at = ${now.toISOString()}
    RETURNING count, reset_at
  `);
  const row = result.rows[0] as { count: number; reset_at: string } | undefined;
  if (!row || row.count <= input.limit) return;
  const retryAfter = Math.max(1, Math.ceil((new Date(row.reset_at).valueOf() - now.valueOf()) / 1000));
  throw new HttpError("Too many attempts. Try again shortly.", 429, { "retry-after": String(retryAfter) });
}
