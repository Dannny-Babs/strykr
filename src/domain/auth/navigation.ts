import type { Role } from "../enums";

export function onboardingDestination(role: Role): string {
  if (role === "REGULATOR_REVIEWER") return "/onboarding/reviewer";
  if (role === "DEALER_ADMIN" || role === "DEALER_USER") return "/onboarding/dealer";
  return "/admin/dashboard";
}

export function destinationForActor(role: Role, onboardingComplete: boolean): string {
  if (!onboardingComplete) return onboardingDestination(role);
  if (role === "REGULATOR_REVIEWER") return "/reviewer/dashboard";
  if (role === "SYSTEM_ADMIN") return "/admin/dashboard";
  return "/dealer/dashboard";
}

export function canAccessProductArea(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/dealer")) return role === "DEALER_ADMIN" || role === "DEALER_USER";
  if (pathname.startsWith("/reviewer")) return role === "REGULATOR_REVIEWER";
  if (pathname.startsWith("/admin")) return role === "SYSTEM_ADMIN";
  return true;
}
