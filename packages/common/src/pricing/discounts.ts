import {
  LAST_MINUTE_DISCOUNT_MAX_DAYS,
  MONTHLY_DISCOUNT_MIN_NIGHTS,
  WEEKLY_DISCOUNT_MIN_NIGHTS,
} from './constants';
import type { DiscountType, IDiscountSetting } from './types';

export interface IDiscountContext {
  nights: number;
  daysToCheckIn: number;
  lastMinute: IDiscountSetting;
  weekly: IDiscountSetting;
  monthly: IDiscountSetting;
}

export interface IResolvedDiscount {
  type: DiscountType;
  percent: number;
}

/**
 * Stacking rule: last-minute stacks with best-of(weekly, monthly).
 * Weekly and monthly are mutually exclusive — monthly wins when both qualify.
 */
export function resolveApplicableDiscounts(
  ctx: IDiscountContext,
): IResolvedDiscount[] {
  const applied: IResolvedDiscount[] = [];

  if (ctx.monthly.enabled && ctx.nights >= MONTHLY_DISCOUNT_MIN_NIGHTS) {
    applied.push({ type: 'monthly', percent: ctx.monthly.percent });
  } else if (ctx.weekly.enabled && ctx.nights >= WEEKLY_DISCOUNT_MIN_NIGHTS) {
    applied.push({ type: 'weekly', percent: ctx.weekly.percent });
  }

  if (
    ctx.lastMinute.enabled &&
    ctx.daysToCheckIn <= LAST_MINUTE_DISCOUNT_MAX_DAYS
  ) {
    applied.push({ type: 'lastMinute', percent: ctx.lastMinute.percent });
  }

  return applied;
}
