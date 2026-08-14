export interface FeeSchedule {
  amount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  jurisdiction: string;
}

export function feeForDate(transactionDate: string, schedules: FeeSchedule[], jurisdiction = "ON"): number {
  const applicable = schedules
    .filter((fee) => fee.jurisdiction === jurisdiction && fee.effectiveFrom <= transactionDate && (!fee.effectiveTo || fee.effectiveTo >= transactionDate))
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  if (!applicable) throw new Error(`Missing fee schedule for ${jurisdiction} on ${transactionDate}.`);
  return applicable.amount;
}
