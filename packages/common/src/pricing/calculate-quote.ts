import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';

import {
  GUEST_FEE_LONG_STAY_MIN_NIGHTS,
  GUEST_FEE_LONG_STAY_RATE,
  GUEST_FEE_SHORT_STAY_RATE,
  HOST_FEE_RATE,
  STRIPE_PASS_THROUGH_RATE,
} from './constants';
import { resolveApplicableDiscounts } from './discounts';
import { getSeasonForDate, isWeekendNight, toDateString } from './seasons';
import type {
  IAppliedDiscountDto,
  IDiscountSetting,
  IPriceBreakdownDto,
  IPriceBreakdownNightDto,
  IQuoteGuestCountDto,
  PricingSeasonId,
} from './types';

export interface ICalculateQuoteSeasonInput {
  weekdayPricePence: number;
  weekendPricePence: number;
}

export interface ICalculateQuotePricingInput {
  cleaningFeePound: number;
  extraGuestThreshold: number;
  extraGuestFeePence: number;
  lastMinute: IDiscountSetting;
  weekly: IDiscountSetting;
  monthly: IDiscountSetting;
}

export interface ICalculateQuoteInput {
  checkInDate: string;
  checkOutDate: string;
  guestCount: IQuoteGuestCountDto;
  quoteAsOf: Date;
  seasonPricing: Record<PricingSeasonId, ICalculateQuoteSeasonInput>;
  overridesByDate: Record<string, number>;
  pricing: ICalculateQuotePricingInput;
}

export function calculateQuote(
  input: ICalculateQuoteInput,
): IPriceBreakdownDto {
  const checkIn = parseISO(input.checkInDate);
  const checkOut = parseISO(input.checkOutDate);

  if (!(checkOut > checkIn)) {
    throw new Error(
      'calculateQuote: checkOutDate must be strictly after checkInDate',
    );
  }

  const nights: IPriceBreakdownNightDto[] = [];
  for (let cursor = checkIn; cursor < checkOut; cursor = addDays(cursor, 1)) {
    const dateStr = toDateString(cursor);
    const season = getSeasonForDate(cursor);
    const isWeekend = isWeekendNight(cursor);
    const override = input.overridesByDate[dateStr];
    const seasonRates = input.seasonPricing[season];
    const rateFromSeason = isWeekend
      ? seasonRates.weekendPricePence
      : seasonRates.weekdayPricePence;
    const rateSourcePence = override ?? rateFromSeason;
    nights.push({
      date: dateStr,
      rateSourcePence,
      isWeekend,
      season,
      isOverride: override !== undefined,
    });
  }

  const nightlyRateSumPence = nights.reduce(
    (sum, n) => sum + n.rateSourcePence,
    0,
  );

  const extraGuests = Math.max(
    0,
    input.guestCount.adults +
      input.guestCount.children -
      input.pricing.extraGuestThreshold,
  );
  const extraGuestTotalPence =
    input.pricing.extraGuestThreshold > 0
      ? extraGuests * nights.length * input.pricing.extraGuestFeePence
      : 0;

  const hostNetSubtotalPence =
    nightlyRateSumPence +
    extraGuestTotalPence +
    input.pricing.cleaningFeePound * 100;

  const daysToCheckIn = Math.max(
    0,
    differenceInCalendarDays(checkIn, input.quoteAsOf),
  );

  const resolvedDiscounts = resolveApplicableDiscounts({
    nights: nights.length,
    daysToCheckIn,
    lastMinute: input.pricing.lastMinute,
    weekly: input.pricing.weekly,
    monthly: input.pricing.monthly,
  });

  let discountedHostNetPence = hostNetSubtotalPence;
  const appliedDiscounts: IAppliedDiscountDto[] = [];
  for (const rd of resolvedDiscounts) {
    const amountPence = Math.round(discountedHostNetPence * (rd.percent / 100));
    appliedDiscounts.push({
      type: rd.type,
      percent: rd.percent,
      amountPence,
    });
    discountedHostNetPence -= amountPence;
  }

  const guestFeeRate =
    nights.length < GUEST_FEE_LONG_STAY_MIN_NIGHTS
      ? GUEST_FEE_SHORT_STAY_RATE
      : GUEST_FEE_LONG_STAY_RATE;
  const guestFeePence = Math.round(discountedHostNetPence * guestFeeRate);
  const hostFeePence = Math.round(discountedHostNetPence * HOST_FEE_RATE);

  const preStripeTotalPence =
    discountedHostNetPence + guestFeePence + hostFeePence;
  const stripeFeePence = Math.round(
    preStripeTotalPence * STRIPE_PASS_THROUGH_RATE,
  );
  const totalGuestPence = preStripeTotalPence + stripeFeePence;

  const hostPayoutPence = discountedHostNetPence;

  return {
    nights,
    nightlyRateSumPence,
    extraGuestTotalPence,
    cleaningFeePound: input.pricing.cleaningFeePound,
    hostNetSubtotalPence,
    appliedDiscounts,
    discountedHostNetPence,
    guestFeePence,
    guestFeeRate,
    hostFeePence,
    stripeFeePence,
    totalGuestPence,
    hostPayoutPence,
    currency: 'GBP',
  };
}
