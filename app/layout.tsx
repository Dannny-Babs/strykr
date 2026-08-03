import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
