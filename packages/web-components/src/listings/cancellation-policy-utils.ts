import { CancellationPolicyShortTermId } from '@repo/skye-hosts-api-client';
import { format, subDays } from 'date-fns';

const POLICY_DAYS: Record<CancellationPolicyShortTermId, number> = {
  [CancellationPolicyShortTermId.FiveDays]: 5,
  [CancellationPolicyShortTermId.FourteenDays]: 14,
  [CancellationPolicyShortTermId.ThirtyDays]: 30,
};

export interface CancellationCutoffs {
  freeCancellationDate: Date;
  partialRefundDate: Date;
  cutoffTime: string;
}

export function getCancellationCutoffs(
  policy: CancellationPolicyShortTermId,
  checkInDate: Date,
  checkInTimeStart: string | null,
): CancellationCutoffs {
  const days = POLICY_DAYS[policy];
  return {
    freeCancellationDate: subDays(checkInDate, days),
    partialRefundDate: checkInDate,
    cutoffTime: checkInTimeStart ?? '15:00',
  };
}

export function formatCancellationDate(date: Date): string {
  return format(date, 'd MMMM');
}
