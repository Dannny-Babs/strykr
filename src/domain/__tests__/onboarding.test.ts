import { describe, expect, it } from "vitest";
import { dealerOnboardingSchema, reviewerOnboardingSchema, signUpSchema } from "../onboarding/schemas";

describe("onboarding validation", () => {
  it("requires a strong password and explicit account type at sign-up", () => {
    expect(signUpSchema.safeParse({ name: "Jordan Smith", email: "jordan@example.test", password: "short", accountType: "dealer" }).success).toBe(false);
    expect(signUpSchema.safeParse({ name: "Jordan Smith", email: "jordan@example.test", password: "Pilot-ready-password-42", accountType: "dealer" }).success).toBe(true);
  });

  it("requires dealership identity before dealer onboarding completes", () => {
    expect(dealerOnboardingSchema.safeParse({ tradeName: "", legalName: "", registrationNumber: "", city: "Hamilton", province: "ON" }).success).toBe(false);
    expect(dealerOnboardingSchema.safeParse({ tradeName: "Northfield Auto", legalName: "Northfield Auto Holdings Inc.", registrationNumber: "ON-041023", city: "Hamilton", province: "ON" }).success).toBe(true);
  });

  it("requires a review organization and jurisdiction for reviewers", () => {
    expect(reviewerOnboardingSchema.safeParse({ organizationName: "", jurisdiction: "ON", jobTitle: "Reviewer" }).success).toBe(false);
    expect(reviewerOnboardingSchema.safeParse({ organizationName: "Ontario Vehicle Transaction Review", jurisdiction: "Ontario", jobTitle: "Compliance reviewer" }).success).toBe(true);
  });
});
