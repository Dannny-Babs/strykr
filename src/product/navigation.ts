export type ProductNavigationItem = { label: string; href: string; description: string };

export const dealerNavigation: ProductNavigationItem[] = [
  { label: "Overview", href: "/dealer/dashboard", description: "Readiness and work requiring attention" },
  { label: "Transactions", href: "/dealer/transactions", description: "Canonical transaction register" },
  { label: "Exceptions", href: "/dealer/exceptions", description: "Responses and evidence requests" },
  { label: "Imports", href: "/dealer/imports", description: "Source files and validation history" },
  { label: "Documents", href: "/dealer/documents", description: "Supporting evidence" },
  { label: "Reports", href: "/dealer/reports", description: "Compliance package exports" },
];

export const reviewerNavigation: ProductNavigationItem[] = [
  { label: "Overview", href: "/reviewer/dashboard", description: "Review workload and priorities" },
  { label: "Dealerships", href: "/reviewer/dealerships", description: "Assigned dealership portfolio" },
  { label: "Exceptions", href: "/reviewer/exceptions", description: "Investigation and response queue" },
  { label: "Audits", href: "/reviewer/audits", description: "Active audits and findings" },
  { label: "Reports", href: "/reviewer/reports", description: "Regulatory exports" },
];
