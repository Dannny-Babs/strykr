import "server-only";

import { redirect } from "next/navigation";
import { destinationForActor } from "@/domain/auth/navigation";
import type { Role } from "@/domain/enums";
import { getCurrentSessionUser } from "./context";

export async function requireProductActor(allowedRoles: Role[]) {
  const actor = await getCurrentSessionUser();
  if (!actor) redirect("/sign-in");
  if (!actor.onboardingComplete) redirect(destinationForActor(actor.role, false));
  if (!allowedRoles.includes(actor.role)) redirect(destinationForActor(actor.role, true));
  return actor;
}
