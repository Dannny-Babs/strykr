import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
  style: ["normal"],
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  applicationName: "Cordena",
  title: "Cordena – VIN-Level Transaction Reconciliation",
  description:
    "Cordena connects vehicle transaction records, evidence, exceptions, and review decisions in one explainable compliance ledger.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cordena",
  },
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
