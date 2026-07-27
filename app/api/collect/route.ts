import { NextResponse } from "next/server";
import { SOURCES } from "../../../lib/sources";
import { collectAll } from "../../../lib/collector";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await collectAll(SOURCES);
  return NextResponse.json({ collectedAt: new Date().toISOString(), count: results.length, results });
}
