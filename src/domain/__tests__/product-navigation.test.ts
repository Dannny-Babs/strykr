import { describe, expect, it } from "vitest";
import { dealerNavigation, reviewerNavigation } from "@/product/navigation";

describe("separate product navigation", () => {
  it("gives each user type a distinct, task-specific navigation model", () => {
    expect(dealerNavigation.map((item) => item.href)).toEqual(["/dealer/dashboard", "/dealer/transactions", "/dealer/exceptions", "/dealer/imports", "/dealer/documents", "/dealer/reports"]);
    expect(reviewerNavigation.map((item) => item.href)).toEqual(["/reviewer/dashboard", "/reviewer/dealerships", "/reviewer/exceptions", "/reviewer/audits", "/reviewer/reports"]);
  });

  it("does not expose a role or workspace switch action inside either product", () => {
    const labels = [...dealerNavigation, ...reviewerNavigation].map((item) => item.label.toLowerCase());
    expect(labels.some((label) => label.includes("switch"))).toBe(false);
    expect(labels.some((label) => label.includes("workspace"))).toBe(false);
  });
});
