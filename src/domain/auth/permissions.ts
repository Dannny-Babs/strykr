import type { Role } from "../enums";

export type Action =
  | "dealership:read" | "transaction:write" | "import:create" | "reconciliation:run"
  | "exception:read" | "exception:respond" | "exception:resolve" | "evidence:create"
  | "audit:write" | "report:export" | "rule:configure" | "user:manage";

const permissions: Record<Role, ReadonlySet<Action>> = {
  REGULATOR_REVIEWER: new Set(["dealership:read", "reconciliation:run", "exception:read", "exception:resolve", "evidence:create", "audit:write", "report:export"]),
  DEALER_ADMIN: new Set(["dealership:read", "transaction:write", "import:create", "exception:read", "exception:respond", "evidence:create", "report:export", "user:manage"]),
  DEALER_USER: new Set(["dealership:read", "transaction:write", "import:create", "exception:read", "exception:respond", "evidence:create", "report:export"]),
  SYSTEM_ADMIN: new Set(["dealership:read", "transaction:write", "import:create", "reconciliation:run", "exception:read", "exception:respond", "exception:resolve", "evidence:create", "audit:write", "report:export", "rule:configure", "user:manage"]),
};

export interface Actor {
  id: string;
  organizationId: string;
  dealershipId: string | null;
  role: Role;
}

export function can(actor: Actor, action: Action): boolean {
  return permissions[actor.role].has(action);
}

export function assertCan(actor: Actor, action: Action, targetDealershipId?: string): void {
  if (!can(actor, action)) throw new AuthorizationError(`Role ${actor.role} cannot perform ${action}.`);
  if (actor.role.startsWith("DEALER_") && targetDealershipId && actor.dealershipId !== targetDealershipId) {
    throw new AuthorizationError("Dealership users cannot access another dealership.");
  }
}

export class AuthorizationError extends Error {
  readonly status = 403;
}
