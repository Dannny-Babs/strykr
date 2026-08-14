"""
Mirrors lib/taxonomy.ts. Kept in sync by hand — same reasoning as
scripts/crawl_sources.py mirroring lib/sources.ts: different runtimes,
static data, low duplication cost.

The "hypothesis" strings are the natural-language claims fed to the NLI
zero-shot classifier (entailment framing per the deep-research report:
avoid a bespoke supervised model until there's labeled data to train one).
"""

PAIN_TAXONOMY = {
    "rule_ambiguity": {
        "label": "Rule ambiguity",
        "hypothesis": "This text expresses confusion about which transactions must be reported or are exempt.",
    },
    "incomplete_preparation": {
        "label": "Incomplete preparation",
        "hypothesis": "This text describes reconstructing records near renewal instead of tracking them continuously.",
    },
    "portal_workflow_friction": {
        "label": "Portal workflow friction",
        "hypothesis": "This text describes frustration with an online portal, upload process, or submission workflow.",
    },
    "no_export_no_api": {
        "label": "No export / no API",
        "hypothesis": "This text describes manually retyping or compiling data because no export or integration exists.",
    },
    "reconciliation_mismatch": {
        "label": "Reconciliation mismatch",
        "hypothesis": "This text describes numbers from different systems or records disagreeing with each other.",
    },
    "fee_calculation_uncertainty": {
        "label": "Fee-calculation uncertainty",
        "hypothesis": "This text describes uncertainty or a change about a fee amount or its effective date.",
    },
    "renewal_delay_risk": {
        "label": "Renewal-delay risk",
        "hypothesis": "This text describes risk of a late fee, blocked renewal, or administrative penalty.",
    },
    "inspection_audit_stress": {
        "label": "Inspection / audit stress",
        "hypothesis": "This text describes anxiety or burden around a regulatory inspection or audit.",
    },
}
