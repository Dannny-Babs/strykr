export type ProductNavigationItem = { label: string; href: string; description: string; count?: number; disabled?: boolean };
export type ProductNavigationGroup = { label: string; items: ProductNavigationItem[] };

export const dealerNavigation: ProductNavigationGroup[] = [
  { label: "Workspace", items: [{ label: "Overview", href: "/dealer/dashboard", description: "Readiness and work requiring attention" }] },
  { label: "Records", items: [
    { label: "Transactions", href: "/dealer/transactions", description: "Canonical transaction register" },
    { label: "Imports", href: "/dealer/imports", description: "Source files and validation history" },
    { label: "Documents", href: "/dealer/documents", description: "Supporting evidence" },
  ] },
  { label: "Review", items: [{ label: "Exceptions", href: "/dealer/exceptions", description: "Responses and evidence requests" }] },
  { label: "Outputs", items: [{ label: "Reports", href: "/dealer/reports", description: "Compliance package exports" }] },
];

export const reviewerNavigation: ProductNavigationGroup[] = [
  { label: "Workspace", items: [{ label: "Overview", href: "/reviewer/dashboard", description: "Review workload and priorities" }] },
  { label: "Review", items: [
    { label: "Dealerships", href: "/reviewer/dealerships", description: "Assigned dealership portfolio" },
    { label: "Exceptions", href: "/reviewer/exceptions", description: "Investigation and response queue" },
    { label: "Audits", href: "/reviewer/audits", description: "Active audits and findings" },
  ] },
  { label: "Outputs", items: [{ label: "Reports", href: "/reviewer/reports", description: "Regulatory exports" }] },
];

export function withExceptionCount(groups: ProductNavigationGroup[], count: number) {
  return groups.map((group) => ({ ...group, items: group.items.map((item) => item.label === "Exceptions" ? { ...item, count } : item) }));
}
