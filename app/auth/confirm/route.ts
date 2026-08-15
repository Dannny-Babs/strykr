import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { destinationForActor } from "@/domain/auth/navigation";
import { provisionSupabaseUser } from "@/server/services/auth";
import { createSupabaseServerClient } from "@/server/supabase/server";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = safeNext(params.get("next"));
  const supabase = await createSupabaseServerClient();

  const verification = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing confirmation token") };

  if (verification.error) return NextResponse.redirect(new URL("/sign-in?auth=invalid-link", request.url));
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/sign-in?auth=invalid-link", request.url));

  if (type === "recovery" || next === "/reset-password") return NextResponse.redirect(new URL("/reset-password", request.url));
  const actor = await provisionSupabaseUser(data.user);
  return NextResponse.redirect(new URL(next === "/" ? destinationForActor(actor.role, actor.onboardingComplete) : next, request.url));
}
