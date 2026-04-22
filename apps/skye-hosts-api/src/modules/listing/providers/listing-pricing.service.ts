import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  calculateQuote,
  DEFAULT_CLEANING_FEE_POUND,
  DEFAULT_LAST_MINUTE_DISCOUNT_PERCENT,
  DEFAULT_MONTHLY_DISCOUNT_PERCENT,
  DEFAULT_WEEKLY_DISCOUNT_PERCENT,
  getSeasonForDate,
  isWeekendNight,
  PRICING_SEASON_IDS,
  toDateString,
  type ICalendarPriceDto,
  type ICalendarPricesResponseDto,
  type IGetListingPricingResponseDto,
  type IGetOverridesResponseDto,
  type IListingPricingGlobalsDto,
  type IPriceBreakdownDto,
  type IQuoteGuestCountDto,
  type IQuoteResponseDto,
  type PricingSeasonId,
} from '@repo/common';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { addDays, parseISO } from 'date-fns';
import { Between, In, Repository } from 'typeorm';
import { ListingAccessService } from '../../co-host/providers/listing-access.service';
import {
  DeleteOverridesRequestDto,
  QuoteRequestDto,
  UpdateCleaningFeeRequestDto,
  UpdateDiscountsRequestDto,
  UpdateSeasonPricingRequestDto,
  UpsertOverridesRequestDto,
} from '../dto';
import {
  Listing,
  ListingPriceOverride,
  ListingPricing,
  ListingSeasonPricing,
} from '../entities';

@Injectable()
export class ListingPricingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(ListingSeasonPricing)
    private readonly seasonRepo: Repository<ListingSeasonPricing>,
    @InjectRepository(ListingPricing)
    private readonly globalsRepo: Repository<ListingPricing>,
    @InjectRepository(ListingPriceOverride)
    private readonly overrideRepo: Repository<ListingPriceOverride>,
    private readonly listingAccessService: ListingAccessService,
  ) {}

  private async assertHostPermission(
    accountId: number,
    listingId: number,
  ): Promise<void> {
    const ok = await this.listingAccessService.hasPermission(
      accountId,
      listingId,
      ListingPermission.EDIT_LISTING,
    );
    if (!ok) {
      throw new ForbiddenException(
        'You do not have permission to edit this listing',
      );
    }
  }

  private async assertListingExists(listingId: number): Promise<void> {
    const exists = await this.listingRepo.exist({ where: { id: listingId } });
    if (!exists) {
      throw new NotFoundException('Listing not found');
    }
  }

  private async ensureGlobals(listingId: number): Promise<ListingPricing> {
    let globals = await this.globalsRepo.findOne({ where: { listingId } });
    if (!globals) {
      const now = new Date();
      globals = await this.globalsRepo.save({
        listingId,
        cleaningFeePound: DEFAULT_CLEANING_FEE_POUND,
        extraGuestThreshold: 0,
        extraGuestFeePence: 0,
        lastMinuteEnabled: false,
        lastMinutePercent: DEFAULT_LAST_MINUTE_DISCOUNT_PERCENT,
        weeklyEnabled: false,
        weeklyPercent: DEFAULT_WEEKLY_DISCOUNT_PERCENT,
        monthlyEnabled: false,
        monthlyPercent: DEFAULT_MONTHLY_DISCOUNT_PERCENT,
        createdAt: now,
        updatedAt: now,
      });
    }
    return globals;
  }

  private toGlobalsDto(globals: ListingPricing): IListingPricingGlobalsDto {
    return {
      cleaningFeePound: globals.cleaningFeePound,
      extraGuestThreshold: globals.extraGuestThreshold,
      extraGuestFeePence: globals.extraGuestFeePence,
      lastMinuteEnabled: globals.lastMinuteEnabled,
      lastMinutePercent: globals.lastMinutePercent,
      weeklyEnabled: globals.weeklyEnabled,
      weeklyPercent: globals.weeklyPercent,
      monthlyEnabled: globals.monthlyEnabled,
      monthlyPercent: globals.monthlyPercent,
    };
  }

  async getPricingConfig(
    listingId: number,
    accountId: number,
  ): Promise<IGetListingPricingResponseDto> {
    await this.assertHostPermission(accountId, listingId);
    const [seasons, globals, overrideCount] = await Promise.all([
      this.seasonRepo.find({ where: { listingId } }),
      this.ensureGlobals(listingId),
      this.overrideRepo.count({ where: { listingId } }),
    ]);
    const seasonsComplete = PRICING_SEASON_IDS.every((s) =>
      seasons.some((row) => row.season === s),
    );
    return {
      seasons: seasons.map((row) => ({
        season: row.season,
        weekdayPricePence: row.weekdayPricePence,
        weekendPricePence: row.weekendPricePence,
      })),
      globals: this.toGlobalsDto(globals),
      overrideCount,
      isComplete: seasonsComplete,
    };
  }

  async upsertSeasonPricing(
    listingId: number,
    accountId: number,
    season: PricingSeasonId,
    dto: UpdateSeasonPricingRequestDto,
  ): Promise<void> {
    await this.assertHostPermission(accountId, listingId);
    if (!PRICING_SEASON_IDS.includes(season)) {
      throw new BadRequestException('Invalid season');
    }
    const now = new Date();
    const existing = await this.seasonRepo.findOne({
      where: { listingId, season },
    });
    if (existing) {
      await this.seasonRepo.save({
        ...existing,
        weekdayPricePence: dto.weekdayPricePence,
        weekendPricePence: dto.weekendPricePence,
        updatedAt: now,
      });
    } else {
      await this.seasonRepo.save({
        listingId,
        season,
        weekdayPricePence: dto.weekdayPricePence,
        weekendPricePence: dto.weekendPricePence,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async upsertDiscounts(
    listingId: number,
    accountId: number,
    dto: UpdateDiscountsRequestDto,
  ): Promise<void> {
    await this.assertHostPermission(accountId, listingId);
    const globals = await this.ensureGlobals(listingId);
    await this.globalsRepo.save({
      ...globals,
      lastMinuteEnabled: dto.lastMinuteEnabled,
      lastMinutePercent: dto.lastMinutePercent,
      weeklyEnabled: dto.weeklyEnabled,
      weeklyPercent: dto.weeklyPercent,
      monthlyEnabled: dto.monthlyEnabled,
      monthlyPercent: dto.monthlyPercent,
      updatedAt: new Date(),
    });
  }

  async updateCleaningFee(
    listingId: number,
    accountId: number,
    dto: UpdateCleaningFeeRequestDto,
  ): Promise<void> {
    await this.assertHostPermission(accountId, listingId);
    const globals = await this.ensureGlobals(listingId);
    await this.globalsRepo.save({
      ...globals,
      cleaningFeePound: dto.cleaningFeePound,
      updatedAt: new Date(),
    });
  }

  async getOverridesInRange(
    listingId: number,
    accountId: number,
    from: string,
    to: string,
  ): Promise<IGetOverridesResponseDto> {
    await this.assertHostPermission(accountId, listingId);
    const rows = await this.overrideRepo.find({
      where: { listingId, date: Between(from, to) },
      order: { date: 'ASC' },
    });
    return {
      overrides: rows.map((row) => ({
        date: row.date,
        pricePence: row.pricePence,
      })),
    };
  }

  async upsertOverridesForDates(
    listingId: number,
    accountId: number,
    dto: UpsertOverridesRequestDto,
  ): Promise<void> {
    await this.assertHostPermission(accountId, listingId);
    const now = new Date();
    const existing = await this.overrideRepo.find({
      where: { listingId, date: In(dto.dates) },
    });
    const existingByDate = new Map(existing.map((row) => [row.date, row]));
    const rows = dto.dates.map((date) => {
      const prior = existingByDate.get(date);
      return prior
        ? { ...prior, pricePence: dto.pricePence, updatedAt: now }
        : {
            listingId,
            date,
            pricePence: dto.pricePence,
            createdAt: now,
            updatedAt: now,
          };
    });
    await this.overrideRepo.save(rows);
  }

  async deleteOverridesForDates(
    listingId: number,
    accountId: number,
    dto: DeleteOverridesRequestDto,
  ): Promise<void> {
    await this.assertHostPermission(accountId, listingId);
    await this.overrideRepo.delete({
      listingId,
      date: In(dto.dates),
    });
  }

  private async loadSeasonPricingMap(
    listingId: number,
  ): Promise<
    Record<
      PricingSeasonId,
      { weekdayPricePence: number; weekendPricePence: number }
    >
  > {
    const rows = await this.seasonRepo.find({ where: { listingId } });
    const map: Partial<
      Record<
        PricingSeasonId,
        { weekdayPricePence: number; weekendPricePence: number }
      >
    > = {};
    for (const row of rows) {
      map[row.season] = {
        weekdayPricePence: row.weekdayPricePence,
        weekendPricePence: row.weekendPricePence,
      };
    }
    for (const s of PRICING_SEASON_IDS) {
      if (!map[s]) {
        throw new BadRequestException(
          'Listing pricing is incomplete: missing season ' + s,
        );
      }
    }
    return map as Record<
      PricingSeasonId,
      { weekdayPricePence: number; weekendPricePence: number }
    >;
  }

  private async loadOverridesByDate(
    listingId: number,
    from: string,
    to: string,
  ): Promise<Record<string, number>> {
    const rows = await this.overrideRepo.find({
      where: { listingId, date: Between(from, to) },
    });
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.date] = row.pricePence;
    }
    return map;
  }

  async computeQuote(
    listingId: number,
    dto: QuoteRequestDto,
  ): Promise<IQuoteResponseDto> {
    await this.assertListingExists(listingId);
    return this.buildBreakdown(
      listingId,
      dto.checkInDate,
      dto.checkOutDate,
      dto.guestCount,
      new Date(),
    );
  }

  async getBreakdownForBooking(
    listingId: number,
    checkInDate: string,
    checkOutDate: string,
    guestCount: IQuoteGuestCountDto,
    quoteAsOf: Date,
  ): Promise<IPriceBreakdownDto> {
    return this.buildBreakdown(
      listingId,
      checkInDate,
      checkOutDate,
      guestCount,
      quoteAsOf,
    );
  }

  private async buildBreakdown(
    listingId: number,
    checkInDate: string,
    checkOutDate: string,
    guestCount: IQuoteGuestCountDto,
    quoteAsOf: Date,
  ): Promise<IPriceBreakdownDto> {
    const [seasonPricing, globals, overridesByDate] = await Promise.all([
      this.loadSeasonPricingMap(listingId),
      this.ensureGlobals(listingId),
      this.loadOverridesByDate(listingId, checkInDate, checkOutDate),
    ]);
    return calculateQuote({
      checkInDate,
      checkOutDate,
      guestCount,
      quoteAsOf,
      seasonPricing,
      overridesByDate,
      pricing: {
        cleaningFeePound: globals.cleaningFeePound,
        extraGuestThreshold: globals.extraGuestThreshold,
        extraGuestFeePence: globals.extraGuestFeePence,
        lastMinute: {
          enabled: globals.lastMinuteEnabled,
          percent: globals.lastMinutePercent,
        },
        weekly: {
          enabled: globals.weeklyEnabled,
          percent: globals.weeklyPercent,
        },
        monthly: {
          enabled: globals.monthlyEnabled,
          percent: globals.monthlyPercent,
        },
      },
    });
  }

  async getCalendarPrices(
    listingId: number,
    accountId: number,
    from: string,
    to: string,
  ): Promise<ICalendarPricesResponseDto> {
    await this.assertHostPermission(accountId, listingId);
    const fromDate = parseISO(from);
    const toDate = parseISO(to);
    if (!(toDate > fromDate)) {
      throw new BadRequestException('`to` must be after `from`');
    }

    const [seasonPricing, overridesByDate] = await Promise.all([
      this.seasonRepo.find({ where: { listingId } }),
      this.loadOverridesByDate(listingId, from, to),
    ]);
    const seasonMap: Partial<
      Record<
        PricingSeasonId,
        { weekdayPricePence: number; weekendPricePence: number }
      >
    > = {};
    for (const row of seasonPricing) {
      seasonMap[row.season] = {
        weekdayPricePence: row.weekdayPricePence,
        weekendPricePence: row.weekendPricePence,
      };
    }

    const prices: ICalendarPriceDto[] = [];
    for (let cursor = fromDate; cursor < toDate; cursor = addDays(cursor, 1)) {
      const dateStr = toDateString(cursor);
      const season = getSeasonForDate(cursor);
      const isWeekend = isWeekendNight(cursor);
      const override = overridesByDate[dateStr];
      const rates = seasonMap[season];
      const seasonRate = rates
        ? isWeekend
          ? rates.weekendPricePence
          : rates.weekdayPricePence
        : null;
      const resolved = override ?? seasonRate;
      if (resolved == null) continue;
      prices.push({
        date: dateStr,
        hostNetPence: resolved,
        isOverride: override !== undefined,
        season,
        isWeekend,
      });
    }
    return { prices };
  }

  async hasCompletePricing(listingId: number): Promise<boolean> {
    const rows = await this.seasonRepo.find({
      where: { listingId },
      select: { season: true },
    });
    const seasons = new Set(rows.map((r) => r.season));
    return PRICING_SEASON_IDS.every((s) => seasons.has(s));
  }
}
