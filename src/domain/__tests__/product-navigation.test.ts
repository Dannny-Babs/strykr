import { describe, expect, it } from "vitest";
import { dealerNavigation, reviewerNavigation, withExceptionCount } from "@/product/navigation";

const paths = (groups: typeof dealerNavigation) => groups.flatMap((group) => group.items.map((item) => item.href));

describe("separate product navigation", () => {
  it("gives each user type a distinct, task-specific navigation model", () => {
    expect(paths(dealerNavigation)).toEqual(["/dealer/dashboard", "/dealer/transactions", "/dealer/imports", "/dealer/documents", "/dealer/exceptions", "/dealer/reports"]);
    expect(paths(reviewerNavigation)).toEqual(["/reviewer/dashboard", "/reviewer/dealerships", "/reviewer/exceptions", "/reviewer/audits", "/reviewer/reports"]);
  });

  it("does not expose a role or workspace switch action inside either product", () => {
    const labels = [...dealerNavigation, ...reviewerNavigation].flatMap((group) => group.items).map((item) => item.label.toLowerCase());
    expect(labels.some((label) => label.includes("switch"))).toBe(false);
    expect(labels.some((label) => label.includes("switch"))).toBe(false);
  });

  it("groups navigation by each role's work and scopes exception counts", () => {
    expect(dealerNavigation.map((group) => group.label)).toEqual(["Workspace", "Records", "Review", "Outputs"]);
    expect(reviewerNavigation.map((group) => group.label)).toEqual(["Workspace", "Review", "Outputs"]);
    const counted = withExceptionCount(reviewerNavigation, 12);
    expect(counted.flatMap((group) => group.items).find((item) => item.label === "Exceptions")?.count).toBe(12);
  });
});
