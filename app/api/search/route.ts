import { getCurrentSessionUser } from "@/server/auth/context";
import { apiError } from "@/server/http/errors";
import { searchAuthorizedRecords } from "@/server/services/search";

export async function GET(request: Request) {
  try {
    const actor = await getCurrentSessionUser();
    if (!actor) return Response.json({ error: "Authentication required." }, { status: 401 });
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return Response.json({ results: searchAuthorizedRecords(actor, query) });
  } catch (error) { return apiError(error); }
}
