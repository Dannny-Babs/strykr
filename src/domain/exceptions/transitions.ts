import type { ExceptionStatus, Role } from "../enums";

const transitions: Record<ExceptionStatus, ExceptionStatus[]> = {
  NEW: ["UNDER_REVIEW", "AWAITING_DEALER", "ESCALATED"], UNDER_REVIEW: ["AWAITING_DEALER", "REVIEWER_ACTION", "RESOLVED", "ESCALATED"],
  AWAITING_DEALER: ["RESPONSE_RECEIVED", "ESCALATED"], RESPONSE_RECEIVED: ["REVIEWER_ACTION", "AWAITING_DEALER"],
  REVIEWER_ACTION: ["RESOLVED", "AWAITING_DEALER", "ESCALATED"], RESOLVED: ["UNDER_REVIEW"], ESCALATED: ["UNDER_REVIEW", "RESOLVED"],
};

export function canTransition(from: ExceptionStatus, to: ExceptionStatus, role: Role): boolean {
  if (!transitions[from].includes(to)) return false;
  if (role.startsWith("DEALER_")) return from === "AWAITING_DEALER" && to === "RESPONSE_RECEIVED";
  return role === "REGULATOR_REVIEWER" || role === "SYSTEM_ADMIN";
}

export function assertTransition(from: ExceptionStatus, to: ExceptionStatus, role: Role): void {
  if (!canTransition(from, to, role)) throw new Error(`Transition from ${from} to ${to} is not allowed for ${role}.`);
}
