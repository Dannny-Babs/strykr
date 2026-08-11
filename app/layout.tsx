import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
  style: ["normal"],
  fallback: ["system-ui", "sans-serif"],
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
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body><TooltipProvider delayDuration={400}>{children}</TooltipProvider></body>
    </html>
  );
}
