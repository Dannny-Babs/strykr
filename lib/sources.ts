export type SourceCategory =
  | "official" // OMVIC itself
  | "government" // Auditor General / Legislative Assembly
  | "industry_association" // UCDA
  | "dms_vendor"; // DMS / dealer software vendors

export type SourceRisk = "low" | "medium" | "high";

export interface Source {
  id: string;
  category: SourceCategory;
  label: string;
  url: string;
  risk: SourceRisk;
  cadence: string;
  notes: string;
}

/**
 * Authoritative-source registry, tier 1 of the source-acquisition plan:
 * OMVIC, government oversight bodies, UCDA, and DMS vendor pages.
 * Deliberately excludes LinkedIn/Facebook/Reddit/YouTube — those carry
 * ToS/legal risk (LinkedIn and Meta prohibit scraping without permission)
 * and rank lowest-priority in the source plan. All URLs below were
 * confirmed live via search, not guessed.
 */
export const SOURCES: Source[] = [
  {
    id: "omvic-transaction-fees",
    category: "official",
    label: "OMVIC — Transaction Fees",
    url: "https://www.omvic.ca/selling/fees/transaction-fees/",
    risk: "low",
    cadence: "weekly",
    notes: "Primary source for the current fee amount and remittance process.",
  },
  {
    id: "omvic-new-fee-reporting-bulletin",
    category: "official",
    label: "OMVIC — Introducing the New Transaction Fee Reporting Process",
    url: "https://www.omvic.ca/news/dealer-bulletins/introducing-the-new-transaction-fee-reporting-process-effective-january-2025/",
    risk: "low",
    cadence: "weekly",
    notes: "Announces the mandatory Transaction Fee Register, effective Jan 6, 2025.",
  },
  {
    id: "omvic-garage-register",
    category: "official",
    label: "OMVIC — Garage Register",
    url: "https://www.omvic.ca/selling/sales-operations/garage-register/",
    risk: "low",
    cadence: "monthly",
    notes: "Recordkeeping obligations dealers must meet, electronic or paper.",
  },
  {
    id: "omvic-fee-consultation-2025",
    category: "official",
    label: "OMVIC — Proposed Changes to Registration and Transaction Fees (2025)",
    url: "https://www.omvic.ca/wp-content/uploads/2025/05/OMVIC-Fee-Consultation-Detail-2025.pdf",
    risk: "low",
    cadence: "ad hoc",
    notes: "Consultation detail behind the fee increase to $22/vehicle.",
  },
  {
    id: "omvic-new-fees-2024",
    category: "official",
    label: "OMVIC — New Fees Effective April 1, 2024",
    url: "https://www.omvic.ca/wp-content/uploads/2024/02/20240131NewFeesDealerBulletin-1.pdf",
    risk: "low",
    cadence: "ad hoc",
    notes: "Prior fee schedule ($12.50), useful for tracking the fee history.",
  },
  {
    id: "omvic-how-to-report-webinar",
    category: "official",
    label: "OMVIC — How To Report Transaction Fees (webinar)",
    url: "https://www.omvic.ca/event/how-to-report-transaction-fees/",
    risk: "low",
    cadence: "monthly",
    notes: "Dealer-facing walkthrough of the reporting workflow.",
  },
  {
    id: "auditor-general-omvic-followup-2023",
    category: "government",
    label: "Auditor General of Ontario — OMVIC Follow-Up (2023, Ch. 3.04)",
    url: "https://www.auditor.on.ca/en/content/annualreports/arreports/en23/3-04FU-PAC_OMVIC_en23.pdf",
    risk: "low",
    cadence: "annual",
    notes: "Hard evidence of under-reporting and OMVIC's corrective actions.",
  },
  {
    id: "auditor-general-omvic-2021-release",
    category: "government",
    label: "Auditor General of Ontario — 2021 News Release on OMVIC",
    url: "https://www.auditor.on.ca/en/content/news/21_newsreleases/2021_news_AR_OMVIC.pdf",
    risk: "low",
    cadence: "annual",
    notes: "Original value-for-money audit findings.",
  },
  {
    id: "ola-public-accounts-omvic-2023",
    category: "government",
    label: "Legislative Assembly of Ontario — Public Accounts Committee Report on OMVIC",
    url: "https://www.ola.org/en/legislative-business/committees/public-accounts/parliament-43/reports/2023-feb-21-value-for-money-audit-ontario-motor-vehicle-industry-council-2021-annual-report-office-a",
    risk: "low",
    cadence: "ad hoc",
    notes: "Legislative follow-up echoing the Auditor General's recommendations.",
  },
  {
    id: "ucda-omvic-transaction-fee",
    category: "industry_association",
    label: "UCDA — OMVIC Transaction Fee",
    url: "https://www.ucda.org/omvic-transaction-fee/",
    risk: "low",
    cadence: "weekly",
    notes: "Dealer-facing guidance on tracking fee-applicable transactions.",
  },
  {
    id: "ucda-can-dealers-afford-omvic",
    category: "industry_association",
    label: "UCDA — Can Dealers Afford OMVIC?",
    url: "https://www.ucda.org/can-dealers-afford-omvic/",
    risk: "low",
    cadence: "ad hoc",
    notes: "Dealer cost-sensitivity signal; informs go-to-market framing.",
  },
  {
    id: "ucda-dealers-cant-afford-omvic",
    category: "industry_association",
    label: "UCDA — Dealers Can't Afford OMVIC",
    url: "https://www.ucda.org/dealers-cant-afford-omvic/",
    risk: "low",
    cadence: "ad hoc",
    notes: "Association-level pushback on fee increases.",
  },
  {
    id: "ucda-frontline-new-fee-process",
    category: "industry_association",
    label: "UCDA Frontline — OMVIC's New Transaction Fee Reporting Process",
    url: "https://frontline.ucda.org/omvics-new-transaction-fee-reporting-process/",
    risk: "low",
    cadence: "weekly",
    notes: "Member-facing breakdown of the register requirements.",
  },
  {
    id: "ucda-dealer-faqs-omvic",
    category: "industry_association",
    label: "UCDA — Dealer FAQs: OMVIC",
    url: "https://www.ucda.org/dealer-faqs/omvic/",
    risk: "low",
    cadence: "monthly",
    notes: "Recurring dealer questions; good source of pain-signal language.",
  },
  {
    id: "dealerpull-home",
    category: "dms_vendor",
    label: "DealerPull — Dealer Management Software",
    url: "https://www.dealerpull.com/",
    risk: "low",
    cadence: "monthly",
    notes: "DMS vendor marketing OMVIC-compliant garage register features.",
  },
  {
    id: "dealerpull-omvic-blog",
    category: "dms_vendor",
    label: "DealerPull — OMVIC and Ontario Auto Dealers: Balancing Protection with Pressure",
    url: "https://www.dealerpull.com/blog-posts/omvic-and-ontario-auto-dealers-balancing-protection-with-pressure",
    risk: "low",
    cadence: "ad hoc",
    notes: "Vendor perspective on dealer sentiment toward OMVIC.",
  },
  {
    id: "movemetal-audit-proof-guide",
    category: "dms_vendor",
    label: "MoveMetal CRM — AMVIC to OMVIC: The Ultimate Audit-Proof Guide",
    url: "https://www.movemetalcrm.com/amvic-to-omvic-audit-proof-guide",
    risk: "low",
    cadence: "ad hoc",
    notes: "Cross-province framing (AMVIC/OMVIC); relevant to expansion story.",
  },
  {
    id: "movemetal-bill-of-sale",
    category: "dms_vendor",
    label: "MoveMetal CRM — OMVIC Bill of Sale Requirements",
    url: "https://www.movemetalcrm.com/omvic-bill-of-sale-requirements",
    risk: "low",
    cadence: "ad hoc",
    notes: "Field-level bill-of-sale requirements, relevant to the output spec.",
  },
];
