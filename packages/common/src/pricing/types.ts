export type PricingSeasonId = 'low' | 'shoulder' | 'peak';

export const PRICING_SEASON_IDS: PricingSeasonId[] = [
  'low',
  'shoulder',
  'peak',
];

export const PRICING_SEASON_LABELS: Record<PricingSeasonId, string> = {
  low: 'Low Season (Winter)',
  shoulder: 'Shoulder Season (Spring & Autumn)',
  peak: 'Peak Season (Summer)',
};

export const PRICING_SEASON_DESCRIPTIONS: Record<PricingSeasonId, string> = {
  low: 'November → February',
  shoulder: 'March → April, September → October',
  peak: 'May → August',
};

export type DiscountType = 'lastMinute' | 'weekly' | 'monthly';

export interface IDiscountSetting {
  enabled: boolean;
  percent: number;
}

export interface IAppliedDiscountDto {
  type: DiscountType;
  percent: number;
  amountPence: number;
}

export interface IPriceBreakdownNightDto {
  date: string;
  rateSourcePence: number;
  isWeekend: boolean;
  season: PricingSeasonId;
  isOverride: boolean;
}

export interface IPriceBreakdownDto {
  nights: IPriceBreakdownNightDto[];
  nightlyRateSumPence: number;
  extraGuestTotalPence: number;
  cleaningFeePound: number;
  hostNetSubtotalPence: number;
  appliedDiscounts: IAppliedDiscountDto[];
  discountedHostNetPence: number;
  guestFeePence: number;
  guestFeeRate: number;
  hostFeePence: number;
  stripeFeePence: number;
  totalGuestPence: number;
  hostPayoutPence: number;
  currency: 'GBP';
}

export interface IListingSeasonPricingDto {
  season: PricingSeasonId;
  weekdayPricePence: number;
  weekendPricePence: number;
}

export interface IListingDiscountsDto {
  lastMinuteEnabled: boolean;
  lastMinutePercent: number;
  weeklyEnabled: boolean;
  weeklyPercent: number;
  monthlyEnabled: boolean;
  monthlyPercent: number;
}

export interface IListingPricingGlobalsDto extends IListingDiscountsDto {
  cleaningFeePound: number;
  extraGuestThreshold: number;
  extraGuestFeePence: number;
}

export interface IUpdateCleaningFeeRequestDto {
  cleaningFeePound: number;
}

export interface IGetListingPricingResponseDto {
  seasons: IListingSeasonPricingDto[];
  globals: IListingPricingGlobalsDto;
  overrideCount: number;
  isComplete: boolean;
}

export interface IUpdateSeasonPricingRequestDto {
  weekdayPricePence: number;
  weekendPricePence: number;
}

export type IUpdateDiscountsRequestDto = IListingDiscountsDto;

export interface IListingPriceOverrideDto {
  date: string;
  pricePence: number;
}

export interface IGetOverridesResponseDto {
  overrides: IListingPriceOverrideDto[];
}

export interface IUpsertOverridesRequestDto {
  dates: string[];
  pricePence: number;
}

export interface IDeleteOverridesRequestDto {
  dates: string[];
}

export interface IQuoteGuestCountDto {
  adults: number;
  children: number;
  babies: number;
}

export interface IQuoteRequestDto {
  checkInDate: string;
  checkOutDate: string;
  guestCount: IQuoteGuestCountDto;
}

export type IQuoteResponseDto = IPriceBreakdownDto;

export interface ICalendarPriceDto {
  date: string;
  hostNetPence: number;
  isOverride: boolean;
  season: PricingSeasonId;
  isWeekend: boolean;
}

export interface ICalendarPricesResponseDto {
  prices: ICalendarPriceDto[];
}
