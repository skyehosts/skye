import { calculateQuote, ICalculateQuoteInput } from './calculate-quote';
import {
  GUEST_FEE_LONG_STAY_RATE,
  GUEST_FEE_SHORT_STAY_RATE,
  HOST_FEE_RATE,
  STRIPE_PASS_THROUGH_RATE,
} from './constants';
import { getSeasonForDate, isWeekendNight } from './seasons';
import type { PricingSeasonId } from './types';

const TEST_CLEANING_FEE_POUND = 25;

const disabledDiscount = { enabled: false, percent: 0 };
const baseSeasonPricing: Record<
  PricingSeasonId,
  { weekdayPricePence: number; weekendPricePence: number }
> = {
  low: { weekdayPricePence: 8000, weekendPricePence: 10000 },
  shoulder: { weekdayPricePence: 10000, weekendPricePence: 12000 },
  peak: { weekdayPricePence: 12000, weekendPricePence: 15000 },
};

function buildInput(
  overrides: Partial<ICalculateQuoteInput> = {},
): ICalculateQuoteInput {
  return {
    checkInDate: '2026-05-04', // Monday, Peak
    checkOutDate: '2026-05-05',
    guestCount: { adults: 2, children: 0, babies: 0 },
    quoteAsOf: new Date('2026-04-01T00:00:00Z'),
    seasonPricing: baseSeasonPricing,
    overridesByDate: {},
    pricing: {
      cleaningFeePound: TEST_CLEANING_FEE_POUND,
      extraGuestThreshold: 0,
      extraGuestFeePence: 0,
      lastMinute: disabledDiscount,
      weekly: disabledDiscount,
      monthly: disabledDiscount,
    },
    ...overrides,
  };
}

describe('getSeasonForDate', () => {
  it.each<[string, PricingSeasonId]>([
    ['2026-02-28', 'low'],
    ['2026-03-01', 'shoulder'],
    ['2026-04-30', 'shoulder'],
    ['2026-05-01', 'peak'],
    ['2026-08-31', 'peak'],
    ['2026-09-01', 'shoulder'],
    ['2026-10-31', 'shoulder'],
    ['2026-11-01', 'low'],
  ])('returns %s season for %s', (dateStr, expected) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    expect(getSeasonForDate(new Date(y, m - 1, d))).toBe(expected);
  });
});

describe('isWeekendNight', () => {
  it('treats Fri and Sat nights as weekend, others as weekday', () => {
    expect(isWeekendNight(new Date(2026, 4, 1))).toBe(true); // Fri
    expect(isWeekendNight(new Date(2026, 4, 2))).toBe(true); // Sat
    expect(isWeekendNight(new Date(2026, 4, 3))).toBe(false); // Sun
    expect(isWeekendNight(new Date(2026, 4, 4))).toBe(false); // Mon
    expect(isWeekendNight(new Date(2026, 4, 7))).toBe(false); // Thu
  });
});

describe('calculateQuote', () => {
  it('computes a single weekday Peak night with no discounts', () => {
    const q = calculateQuote(buildInput());
    expect(q.nights).toHaveLength(1);
    expect(q.nights[0].rateSourcePence).toBe(12000);
    expect(q.nights[0].season).toBe('peak');
    expect(q.nights[0].isWeekend).toBe(false);
    expect(q.nightlyRateSumPence).toBe(12000);
    expect(q.cleaningFeePound).toBe(TEST_CLEANING_FEE_POUND);
    expect(q.hostNetSubtotalPence).toBe(12000 + TEST_CLEANING_FEE_POUND * 100);
    expect(q.appliedDiscounts).toHaveLength(0);
    expect(q.discountedHostNetPence).toBe(q.hostNetSubtotalPence);
    expect(q.guestFeeRate).toBe(GUEST_FEE_SHORT_STAY_RATE);
    expect(q.guestFeePence).toBe(
      Math.round(q.hostNetSubtotalPence * GUEST_FEE_SHORT_STAY_RATE),
    );
    expect(q.hostFeePence).toBe(
      Math.round(q.hostNetSubtotalPence * HOST_FEE_RATE),
    );
    expect(q.hostPayoutPence).toBe(q.discountedHostNetPence);
  });

  it('uses the weekend rate on Fri/Sat nights', () => {
    const q = calculateQuote(
      buildInput({ checkInDate: '2026-05-01', checkOutDate: '2026-05-02' }),
    );
    expect(q.nights[0].isWeekend).toBe(true);
    expect(q.nights[0].rateSourcePence).toBe(15000);
  });

  it('drops guest fee to 0 on 3+ night stays', () => {
    const q = calculateQuote(
      buildInput({ checkInDate: '2026-05-04', checkOutDate: '2026-05-07' }),
    );
    expect(q.nights).toHaveLength(3);
    expect(q.guestFeeRate).toBe(GUEST_FEE_LONG_STAY_RATE);
    expect(q.guestFeePence).toBe(0);
  });

  it('applies the weekly discount at 7 nights when monthly is disabled', () => {
    const q = calculateQuote(
      buildInput({
        checkInDate: '2026-05-04',
        checkOutDate: '2026-05-11',
        pricing: {
          cleaningFeePound: 0,
          extraGuestThreshold: 0,
          extraGuestFeePence: 0,
          lastMinute: disabledDiscount,
          weekly: { enabled: true, percent: 10 },
          monthly: disabledDiscount,
        },
      }),
    );
    expect(q.appliedDiscounts).toEqual([
      expect.objectContaining({ type: 'weekly', percent: 10 }),
    ]);
    expect(q.discountedHostNetPence).toBeLessThan(q.hostNetSubtotalPence);
  });

  it('monthly discount wins over weekly when both qualify at 28 nights', () => {
    const q = calculateQuote(
      buildInput({
        checkInDate: '2026-05-04',
        checkOutDate: '2026-06-01',
        pricing: {
          cleaningFeePound: 0,
          extraGuestThreshold: 0,
          extraGuestFeePence: 0,
          lastMinute: disabledDiscount,
          weekly: { enabled: true, percent: 10 },
          monthly: { enabled: true, percent: 20 },
        },
      }),
    );
    expect(q.appliedDiscounts).toHaveLength(1);
    expect(q.appliedDiscounts[0].type).toBe('monthly');
  });

  it('stacks last-minute with weekly when both apply', () => {
    const q = calculateQuote(
      buildInput({
        quoteAsOf: new Date('2026-04-28T00:00:00Z'),
        checkInDate: '2026-05-04',
        checkOutDate: '2026-05-11',
        pricing: {
          cleaningFeePound: 0,
          extraGuestThreshold: 0,
          extraGuestFeePence: 0,
          lastMinute: { enabled: true, percent: 5 },
          weekly: { enabled: true, percent: 10 },
          monthly: disabledDiscount,
        },
      }),
    );
    expect(q.appliedDiscounts.map((d) => d.type).sort()).toEqual([
      'lastMinute',
      'weekly',
    ]);
  });

  it('per-night rates track season changes across a boundary stay', () => {
    const q = calculateQuote(
      buildInput({
        checkInDate: '2026-10-30',
        checkOutDate: '2026-11-03',
      }),
    );
    const seasons = q.nights.map((n) => n.season);
    expect(seasons).toEqual(['shoulder', 'shoulder', 'low', 'low']);
  });

  it('applies overrides on specific nights; other nights use the season rate', () => {
    const q = calculateQuote(
      buildInput({
        checkInDate: '2026-05-04',
        checkOutDate: '2026-05-07',
        overridesByDate: { '2026-05-05': 20000 },
      }),
    );
    expect(q.nights[0].isOverride).toBe(false);
    expect(q.nights[1].isOverride).toBe(true);
    expect(q.nights[1].rateSourcePence).toBe(20000);
    expect(q.nights[2].isOverride).toBe(false);
  });

  it('counts adults + children toward extra-guest fee but excludes babies', () => {
    const q = calculateQuote(
      buildInput({
        guestCount: { adults: 3, children: 1, babies: 2 },
        pricing: {
          cleaningFeePound: 0,
          extraGuestThreshold: 2,
          extraGuestFeePence: 1000,
          lastMinute: disabledDiscount,
          weekly: disabledDiscount,
          monthly: disabledDiscount,
        },
      }),
    );
    // 3 adults + 1 child = 4 guests; 4 - 2 threshold = 2 extras × 1 night × £10 = £20.
    expect(q.extraGuestTotalPence).toBe(2 * 1 * 1000);
  });

  it('applies the stripe pass-through on top of the Skye-included subtotal', () => {
    const q = calculateQuote(buildInput());
    const expectedPreStripe =
      q.discountedHostNetPence + q.guestFeePence + q.hostFeePence;
    expect(q.stripeFeePence).toBe(
      Math.round(expectedPreStripe * STRIPE_PASS_THROUGH_RATE),
    );
    expect(q.totalGuestPence).toBe(expectedPreStripe + q.stripeFeePence);
  });

  it('throws when checkOutDate is not after checkInDate', () => {
    expect(() =>
      calculateQuote(
        buildInput({ checkInDate: '2026-05-04', checkOutDate: '2026-05-04' }),
      ),
    ).toThrow(/strictly after/);
  });
});
