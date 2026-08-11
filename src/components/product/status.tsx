import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toUpperCase(); const danger = normalized.includes("HIGH") || normalized.includes("CRITICAL") || normalized === "NEW" || normalized.includes("FAILED"); const complete = normalized.includes("MATCHED") || normalized.includes("COMPLETED") || normalized.includes("RESOLVED") || normalized.includes("VERIFIED");
  return <Badge variant={danger ? "destructive" : complete ? "default" : "secondary"} className="font-normal">{value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</Badge>;
}

export const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
export const dateLabel = (value: string | null | undefined) => value ? new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "—";
