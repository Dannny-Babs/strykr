import { Circle, CircleAlert, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toUpperCase(); const danger = normalized.includes("HIGH") || normalized.includes("CRITICAL") || normalized === "NEW" || normalized.includes("FAILED"); const complete = normalized.includes("MATCHED") || normalized.includes("COMPLETED") || normalized.includes("RESOLVED") || normalized.includes("VERIFIED"); const Icon = danger ? CircleAlert : complete ? CircleCheck : Circle;
  return <Badge variant={danger ? "destructive" : complete ? "success" : "warning"}><Icon className="size-3" />{value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</Badge>;
}

export const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
export const dateLabel = (value: string | null | undefined) => { if (!value) return "—"; const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date); };
