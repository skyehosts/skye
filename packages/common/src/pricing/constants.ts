/**
 * Single source of truth for pricing rates across all apps. Promote to env vars
 * before production launch if fees need to change without a deploy.
 *
 * The model:
 *   - Host enters a NET price (what arrives in their bank).
 *   - Skye adds a host fee + stay-length-tiered guest fee on top of host net.
 *   - Stripe pass-through is added on top of the Skye-included subtotal.
 *   - Guest pays the total; host receives exactly the net they entered.
 *
 * Approximate guest markup vs host net:
 *   - 1-2 night bookings: ~9% (cf. Airbnb ~18%)
 *   - 3+ night bookings: ~6% (cf. Airbnb ~15%)
 */

export const HOST_FEE_RATE = 0.03;
export const GUEST_FEE_SHORT_STAY_RATE = 0.03;
export const GUEST_FEE_LONG_STAY_RATE = 0;
export const STRIPE_PASS_THROUGH_RATE = 0.03;

export const GUEST_FEE_LONG_STAY_MIN_NIGHTS = 3;

export const LAST_MINUTE_DISCOUNT_MAX_DAYS = 14;
export const WEEKLY_DISCOUNT_MIN_NIGHTS = 7;
export const MONTHLY_DISCOUNT_MIN_NIGHTS = 28;

export const DEFAULT_LAST_MINUTE_DISCOUNT_PERCENT = 5;
export const DEFAULT_WEEKLY_DISCOUNT_PERCENT = 10;
export const DEFAULT_MONTHLY_DISCOUNT_PERCENT = 20;

export const DEFAULT_CLEANING_FEE_POUND = 0;
export const MAX_CLEANING_FEE_POUND = 500;

// ISO weekdays that count as a "weekend night" (Mon=1..Sun=7). Fri + Sat.
export const WEEKEND_NIGHT_ISO_WEEKDAYS: readonly number[] = [5, 6] as const;
