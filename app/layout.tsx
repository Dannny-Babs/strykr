import type { Metadata } from "next";
import { Rethink_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DealerSync – VIN-Level Transaction Reconciliation",
  description:
    "DealerSync reconciles a dealer's DMS, accounting, and bills of sale into one defensible OMVIC Transaction Fee Register — so you stop overpaying and walk into an audit with proof, not paperwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rethinkSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
