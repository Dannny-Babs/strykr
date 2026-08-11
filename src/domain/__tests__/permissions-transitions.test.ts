import { describe, expect, it } from "vitest";
import { assertCan, can, type Actor } from "../auth/permissions";
import { canTransition } from "../exceptions/transitions";

const dealer: Actor = { id: "dealer-user", organizationId: "org-dealer", dealershipId: "dealer-1", role: "DEALER_USER" };
const reviewer: Actor = { id: "reviewer", organizationId: "org-regulator", dealershipId: null, role: "REGULATOR_REVIEWER" };

describe("authorization", () => {
  it("allows dealer-owned imports but prevents cross-dealership access and resolution", () => { expect(can(dealer, "import:create")).toBe(true); expect(() => assertCan(dealer, "exception:read", "dealer-2")).toThrow("another dealership"); expect(can(dealer, "exception:resolve")).toBe(false); });
  it("allows reviewers to resolve but not submit dealer responses", () => { expect(can(reviewer, "exception:resolve")).toBe(true); expect(can(reviewer, "exception:respond")).toBe(false); });
  it("enforces role-specific exception transitions", () => { expect(canTransition("AWAITING_DEALER", "RESPONSE_RECEIVED", "DEALER_USER")).toBe(true); expect(canTransition("NEW", "RESOLVED", "DEALER_USER")).toBe(false); expect(canTransition("UNDER_REVIEW", "RESOLVED", "REGULATOR_REVIEWER")).toBe(true); });
});
