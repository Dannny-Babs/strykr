import type { Metadata } from "next";
import "./globals.css";
import "./workflow.css";
import { Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DealerSync – VIN-Level Transaction Reconciliation",
  description:
    "DealerSync connects vehicle transaction records, evidence, exceptions, and review decisions in one explainable compliance ledger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", instrumentSans.variable)}>
      <body><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  );
}
