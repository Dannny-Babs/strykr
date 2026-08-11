import { describe, expect, it } from "vitest";
import { canAccessProductArea, destinationForActor, onboardingDestination } from "../auth/navigation";

describe("role-owned product routes", () => {
  it("sends dealer roles only to the dealer application", () => {
    expect(destinationForActor("DEALER_ADMIN", true)).toBe("/dealer/dashboard");
    expect(destinationForActor("DEALER_USER", true)).toBe("/dealer/dashboard");
    expect(canAccessProductArea("DEALER_USER", "/dealer/exceptions")).toBe(true);
    expect(canAccessProductArea("DEALER_USER", "/reviewer/exceptions")).toBe(false);
  });

  it("sends reviewers and system administrators to their own applications", () => {
    expect(destinationForActor("REGULATOR_REVIEWER", true)).toBe("/reviewer/dashboard");
    expect(destinationForActor("SYSTEM_ADMIN", true)).toBe("/admin/dashboard");
    expect(canAccessProductArea("REGULATOR_REVIEWER", "/dealer/dashboard")).toBe(false);
  });

  it("requires role-specific onboarding before product access", () => {
    expect(destinationForActor("DEALER_ADMIN", false)).toBe("/onboarding/dealer");
    expect(destinationForActor("REGULATOR_REVIEWER", false)).toBe("/onboarding/reviewer");
    expect(onboardingDestination("SYSTEM_ADMIN")).toBe("/admin/dashboard");
  });
});
