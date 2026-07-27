export type PainLabel =
  | "rule_ambiguity"
  | "incomplete_preparation"
  | "portal_workflow_friction"
  | "no_export_no_api"
  | "reconciliation_mismatch"
  | "fee_calculation_uncertainty"
  | "renewal_delay_risk"
  | "inspection_audit_stress";

export const PAIN_TAXONOMY: Record<PainLabel, { label: string; description: string }> = {
  rule_ambiguity: {
    label: "Rule ambiguity",
    description: "Confusion about what must be reported or which transactions are exempt.",
  },
  incomplete_preparation: {
    label: "Incomplete preparation",
    description: "Annual reconstruction of records near renewal instead of ongoing tracking.",
  },
  portal_workflow_friction: {
    label: "Portal workflow friction",
    description: "Frustration with upload, portal steps, approvals, or non-editable submissions.",
  },
  no_export_no_api: {
    label: "No export / no API",
    description: "Need to retype or manually compile data from multiple systems.",
  },
  reconciliation_mismatch: {
    label: "Reconciliation mismatch",
    description: "OMVIC/MTO/garage register/DMS numbers disagree.",
  },
  fee_calculation_uncertainty: {
    label: "Fee-calculation uncertainty",
    description: "Wrong fee amount or misunderstanding of effective dates.",
  },
  renewal_delay_risk: {
    label: "Renewal-delay risk",
    description: "Fear of late fees, blocked renewal, or administrative action.",
  },
  inspection_audit_stress: {
    label: "Inspection / audit stress",
    description: "Anxiety around OMVIC/MTO review and evidence requests.",
  },
};
