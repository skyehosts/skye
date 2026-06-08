import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingAccessService } from '../../co-host/providers/listing-access.service';
import {
  Listing,
  ListingPriceOverride,
  ListingPricing,
  ListingSeasonPricing,
} from '../entities';
import { ListingPricingService } from './listing-pricing.service';

const TEST_CLEANING_FEE_POUND = 25;

const LISTING_ID = 10;
const ACCOUNT_ID = 42;

function seasonRow(
  season: 'low' | 'shoulder' | 'peak',
  weekday: number,
  weekend: number,
) {
  return {
    id: Math.floor(Math.random() * 1000),
    listingId: LISTING_ID,
    season,
    weekdayPricePence: weekday,
    weekendPricePence: weekend,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function globalsRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    listingId: LISTING_ID,
    cleaningFeePound: TEST_CLEANING_FEE_POUND,
    extraGuestThreshold: 0,
    extraGuestFeePence: 0,
    lastMinuteEnabled: false,
    lastMinutePercent: 5,
    weeklyEnabled: false,
    weeklyPercent: 10,
    monthlyEnabled: false,
    monthlyPercent: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ListingPricingService', () => {
  let service: ListingPricingService;
  let listingRepo: { exist: jest.Mock };
  let seasonRepo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };
  let globalsRepo: { findOne: jest.Mock; save: jest.Mock };
  let overrideRepo: {
    find: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };
  let listingAccessService: { hasPermission: jest.Mock };

  beforeEach(async () => {
    listingRepo = { exist: jest.fn() };
    seasonRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
    globalsRepo = { findOne: jest.fn(), save: jest.fn() };
    overrideRepo = {
      find: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    listingAccessService = { hasPermission: jest.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingPricingService,
        { provide: getRepositoryToken(Listing), useValue: listingRepo },
        {
          provide: getRepositoryToken(ListingSeasonPricing),
          useValue: seasonRepo,
        },
        { provide: getRepositoryToken(ListingPricing), useValue: globalsRepo },
        {
          provide: getRepositoryToken(ListingPriceOverride),
          useValue: overrideRepo,
        },
        { provide: ListingAccessService, useValue: listingAccessService },
      ],
    }).compile();

    service = module.get(ListingPricingService);
  });

  describe('getPricingConfig', () => {
    it('returns full config with isComplete=true when all three seasons are set', async () => {
      seasonRepo.find.mockResolvedValue([
        seasonRow('low', 8000, 10000),
        seasonRow('shoulder', 10000, 12000),
        seasonRow('peak', 12000, 15000),
      ]);
      globalsRepo.findOne.mockResolvedValue(globalsRow());
      overrideRepo.count.mockResolvedValue(2);

      const result = await service.getPricingConfig(LISTING_ID, ACCOUNT_ID);

      expect(result.isComplete).toBe(true);
      expect(result.seasons).toHaveLength(3);
      expect(result.overrideCount).toBe(2);
      expect(result.globals.cleaningFeePound).toBe(TEST_CLEANING_FEE_POUND);
    });

    it('returns isComplete=false when a season is missing', async () => {
      seasonRepo.find.mockResolvedValue([
        seasonRow('low', 8000, 10000),
        seasonRow('shoulder', 10000, 12000),
      ]);
      globalsRepo.findOne.mockResolvedValue(globalsRow());
      overrideRepo.count.mockResolvedValue(0);

      const result = await service.getPricingConfig(LISTING_ID, ACCOUNT_ID);

      expect(result.isComplete).toBe(false);
    });

    it('creates default globals when none exist', async () => {
      seasonRepo.find.mockResolvedValue([]);
      globalsRepo.findOne.mockResolvedValue(null);
      globalsRepo.save.mockImplementation(async (row) => ({ id: 1, ...row }));
      overrideRepo.count.mockResolvedValue(0);

      const result = await service.getPricingConfig(LISTING_ID, ACCOUNT_ID);

      expect(globalsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listingId: LISTING_ID,
          cleaningFeePound: 0,
          lastMinuteEnabled: false,
          weeklyEnabled: false,
          monthlyEnabled: false,
        }),
      );
      expect(result.globals.cleaningFeePound).toBe(0);
    });

    it('throws ForbiddenException when the user lacks edit permission', async () => {
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(
        service.getPricingConfig(LISTING_ID, ACCOUNT_ID),
      ).rejects.toThrow(ForbiddenException);
      expect(seasonRepo.find).not.toHaveBeenCalled();
    });
  });

  describe('upsertSeasonPricing', () => {
    it('inserts a new season row when none exists', async () => {
      seasonRepo.findOne.mockResolvedValue(null);

      await service.upsertSeasonPricing(LISTING_ID, ACCOUNT_ID, 'peak', {
        weekdayPricePence: 12000,
        weekendPricePence: 15000,
      });

      expect(seasonRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listingId: LISTING_ID,
          season: 'peak',
          weekdayPricePence: 12000,
          weekendPricePence: 15000,
        }),
      );
      expect(seasonRepo.save.mock.calls[0][0]).not.toHaveProperty('id');
    });

    it('updates an existing season row in place', async () => {
      const existing = seasonRow('peak', 10000, 12000);
      seasonRepo.findOne.mockResolvedValue(existing);

      await service.upsertSeasonPricing(LISTING_ID, ACCOUNT_ID, 'peak', {
        weekdayPricePence: 14000,
        weekendPricePence: 16000,
      });

      expect(seasonRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existing.id,
          weekdayPricePence: 14000,
          weekendPricePence: 16000,
        }),
      );
    });

    it('throws ForbiddenException when unauthorized', async () => {
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(
        service.upsertSeasonPricing(LISTING_ID, ACCOUNT_ID, 'peak', {
          weekdayPricePence: 1,
          weekendPricePence: 2,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(seasonRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('upsertDiscounts', () => {
    it('persists the discount settings on the globals row', async () => {
      const existing = globalsRow();
      globalsRepo.findOne.mockResolvedValue(existing);

      await service.upsertDiscounts(LISTING_ID, ACCOUNT_ID, {
        lastMinuteEnabled: true,
        lastMinutePercent: 7,
        weeklyEnabled: true,
        weeklyPercent: 12,
        monthlyEnabled: false,
        monthlyPercent: 20,
      });

      expect(globalsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existing.id,
          lastMinuteEnabled: true,
          lastMinutePercent: 7,
          weeklyEnabled: true,
          weeklyPercent: 12,
          monthlyEnabled: false,
        }),
      );
    });
  });

  describe('updateCleaningFee', () => {
    it('persists the cleaning fee on the globals row', async () => {
      const existing = globalsRow();
      globalsRepo.findOne.mockResolvedValue(existing);

      await service.updateCleaningFee(LISTING_ID, ACCOUNT_ID, {
        cleaningFeePound: 40,
      });

      expect(globalsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existing.id,
          cleaningFeePound: 40,
        }),
      );
    });

    it('preserves unrelated fields (discounts, extra-guest) on the globals row', async () => {
      const existing = globalsRow({
        lastMinutePercent: 8,
        extraGuestFeePence: 1500,
      });
      globalsRepo.findOne.mockResolvedValue(existing);

      await service.updateCleaningFee(LISTING_ID, ACCOUNT_ID, {
        cleaningFeePound: 40,
      });

      expect(globalsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existing.id,
          cleaningFeePound: 40,
          lastMinutePercent: 8,
          extraGuestFeePence: 1500,
        }),
      );
    });

    it('bootstraps a globals row before applying the fee when none exists', async () => {
      globalsRepo.findOne.mockResolvedValue(null);
      globalsRepo.save.mockImplementation(async (row) => ({ id: 99, ...row }));

      await service.updateCleaningFee(LISTING_ID, ACCOUNT_ID, {
        cleaningFeePound: 30,
      });

      expect(globalsRepo.save.mock.calls[0][0]).toMatchObject({
        listingId: LISTING_ID,
        cleaningFeePound: 0,
      });
      expect(globalsRepo.save.mock.calls[1][0]).toMatchObject({
        cleaningFeePound: 30,
      });
    });

    it('accepts 0 (sentinel for "not set") without clearing other fields', async () => {
      const existing = globalsRow({
        cleaningFeePound: 50,
        lastMinuteEnabled: true,
      });
      globalsRepo.findOne.mockResolvedValue(existing);

      await service.updateCleaningFee(LISTING_ID, ACCOUNT_ID, {
        cleaningFeePound: 0,
      });

      expect(globalsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cleaningFeePound: 0,
          lastMinuteEnabled: true,
        }),
      );
    });

    it('throws ForbiddenException when unauthorized', async () => {
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(
        service.updateCleaningFee(LISTING_ID, ACCOUNT_ID, {
          cleaningFeePound: 30,
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(globalsRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('overrides', () => {
    it('upserts by merging with existing rows (updates existing, inserts new)', async () => {
      const existing = {
        id: 99,
        listingId: LISTING_ID,
        date: '2027-05-01',
        pricePence: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      overrideRepo.find.mockResolvedValue([existing]);

      await service.upsertOverridesForDates(LISTING_ID, ACCOUNT_ID, {
        dates: ['2027-05-01', '2027-05-02'],
        pricePence: 20000,
      });

      expect(overrideRepo.save).toHaveBeenCalledTimes(1);
      const rows = overrideRepo.save.mock.calls[0][0];
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({ id: 99, pricePence: 20000 });
      expect(rows[1]).toMatchObject({
        listingId: LISTING_ID,
        date: '2027-05-02',
        pricePence: 20000,
      });
      expect(rows[1]).not.toHaveProperty('id');
    });

    it('deletes override rows for the supplied dates only', async () => {
      await service.deleteOverridesForDates(LISTING_ID, ACCOUNT_ID, {
        dates: ['2027-05-03', '2027-05-04'],
      });

      expect(overrideRepo.delete).toHaveBeenCalledWith(
        expect.objectContaining({ listingId: LISTING_ID }),
      );
    });

    it('returns overrides from a range query', async () => {
      overrideRepo.find.mockResolvedValue([
        {
          id: 1,
          listingId: LISTING_ID,
          date: '2027-05-01',
          pricePence: 12345,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.getOverridesInRange(
        LISTING_ID,
        ACCOUNT_ID,
        '2027-05-01',
        '2027-05-31',
      );

      expect(result.overrides).toEqual([
        { date: '2027-05-01', pricePence: 12345 },
      ]);
    });
  });

  describe('computeQuote', () => {
    function configureAllSeasons(globals = globalsRow()) {
      listingRepo.exist.mockResolvedValue(true);
      seasonRepo.find.mockResolvedValue([
        seasonRow('low', 8000, 10000),
        seasonRow('shoulder', 10000, 12000),
        seasonRow('peak', 12000, 15000),
      ]);
      globalsRepo.findOne.mockResolvedValue(globals);
      overrideRepo.find.mockResolvedValue([]);
    }

    it('computes a breakdown with the short-stay guest fee for a 1-night stay', async () => {
      configureAllSeasons();

      // Mon 2027-07-05 (peak weekday) → Tue 2027-07-06 = 1 night
      const result = await service.computeQuote(LISTING_ID, {
        checkInDate: '2027-07-05',
        checkOutDate: '2027-07-06',
        guestCount: { adults: 2, children: 0, babies: 0 },
      });

      expect(result.nights).toHaveLength(1);
      expect(result.nights[0].season).toBe('peak');
      expect(result.nights[0].isWeekend).toBe(false);
      expect(result.nightlyRateSumPence).toBe(12000);
      expect(result.guestFeeRate).toBe(0.03);
      expect(result.currency).toBe('GBP');
    });

    it('drops the guest fee to zero at the 3-night tier flip', async () => {
      configureAllSeasons();

      const result = await service.computeQuote(LISTING_ID, {
        checkInDate: '2027-07-05',
        checkOutDate: '2027-07-08',
        guestCount: { adults: 2, children: 0, babies: 0 },
      });

      expect(result.nights).toHaveLength(3);
      expect(result.guestFeeRate).toBe(0);
      expect(result.guestFeePence).toBe(0);
    });

    it('applies overrides in place of season rates', async () => {
      configureAllSeasons();
      overrideRepo.find.mockResolvedValue([
        {
          id: 1,
          listingId: LISTING_ID,
          date: '2027-07-05',
          pricePence: 99999,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.computeQuote(LISTING_ID, {
        checkInDate: '2027-07-05',
        checkOutDate: '2027-07-06',
        guestCount: { adults: 2, children: 0, babies: 0 },
      });

      expect(result.nights[0].rateSourcePence).toBe(99999);
      expect(result.nights[0].isOverride).toBe(true);
    });

    it('throws BadRequestException when pricing is incomplete', async () => {
      listingRepo.exist.mockResolvedValue(true);
      seasonRepo.find.mockResolvedValue([seasonRow('low', 8000, 10000)]);
      globalsRepo.findOne.mockResolvedValue(globalsRow());
      overrideRepo.find.mockResolvedValue([]);

      await expect(
        service.computeQuote(LISTING_ID, {
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when the listing does not exist', async () => {
      listingRepo.exist.mockResolvedValue(false);

      await expect(
        service.computeQuote(LISTING_ID, {
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not require host permission (public quote endpoint)', async () => {
      configureAllSeasons();

      await service.computeQuote(LISTING_ID, {
        checkInDate: '2027-07-05',
        checkOutDate: '2027-07-06',
        guestCount: { adults: 2, children: 0, babies: 0 },
      });

      expect(listingAccessService.hasPermission).not.toHaveBeenCalled();
    });
  });

  describe('getBreakdownForBooking', () => {
    it('uses the supplied quoteAsOf so last-minute eligibility is historical', async () => {
      listingRepo.exist.mockResolvedValue(true);
      seasonRepo.find.mockResolvedValue([
        seasonRow('low', 8000, 10000),
        seasonRow('shoulder', 10000, 12000),
        seasonRow('peak', 12000, 15000),
      ]);
      globalsRepo.findOne.mockResolvedValue(
        globalsRow({ lastMinuteEnabled: true, lastMinutePercent: 10 }),
      );
      overrideRepo.find.mockResolvedValue([]);

      // quoteAsOf is 5 days before check-in so last-minute (<=14 days) applies.
      const breakdown = await service.getBreakdownForBooking(
        LISTING_ID,
        '2027-07-06',
        '2027-07-07',
        { adults: 2, children: 0, babies: 0 },
        new Date('2027-07-01T00:00:00Z'),
      );

      expect(breakdown.appliedDiscounts).toHaveLength(1);
      expect(breakdown.appliedDiscounts[0].type).toBe('lastMinute');
    });
  });

  describe('getCalendarPrices', () => {
    it('returns a per-date price, flagging overrides and weekend nights', async () => {
      seasonRepo.find.mockResolvedValue([seasonRow('peak', 12000, 15000)]);
      overrideRepo.find.mockResolvedValue([
        {
          id: 1,
          listingId: LISTING_ID,
          date: '2027-07-05',
          pricePence: 20000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // 2027-07-02 = Fri, 2027-07-03 = Sat, 2027-07-04 = Sun → only Fri+Sat are weekend nights.
      const result = await service.getCalendarPrices(
        LISTING_ID,
        ACCOUNT_ID,
        '2027-07-02',
        '2027-07-06',
      );

      expect(result.prices).toHaveLength(4);
      const byDate = Object.fromEntries(result.prices.map((p) => [p.date, p]));
      expect(byDate['2027-07-02'].isWeekend).toBe(true);
      expect(byDate['2027-07-02'].hostNetPence).toBe(15000);
      expect(byDate['2027-07-04'].isWeekend).toBe(false);
      expect(byDate['2027-07-04'].hostNetPence).toBe(12000);
      expect(byDate['2027-07-05'].isOverride).toBe(true);
      expect(byDate['2027-07-05'].hostNetPence).toBe(20000);
    });

    it('throws BadRequestException when `to` is not strictly after `from`', async () => {
      await expect(
        service.getCalendarPrices(
          LISTING_ID,
          ACCOUNT_ID,
          '2027-07-05',
          '2027-07-05',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('omits days without a configured season rate', async () => {
      seasonRepo.find.mockResolvedValue([]);
      overrideRepo.find.mockResolvedValue([]);

      const result = await service.getCalendarPrices(
        LISTING_ID,
        ACCOUNT_ID,
        '2027-07-02',
        '2027-07-04',
      );

      expect(result.prices).toEqual([]);
    });
  });

  describe('hasCompletePricing', () => {
    it('returns true when all three seasons are present', async () => {
      seasonRepo.find.mockResolvedValue([
        { season: 'low' },
        { season: 'shoulder' },
        { season: 'peak' },
      ]);
      expect(await service.hasCompletePricing(LISTING_ID)).toBe(true);
    });

    it('returns false when a season is missing', async () => {
      seasonRepo.find.mockResolvedValue([
        { season: 'low' },
        { season: 'shoulder' },
      ]);
      expect(await service.hasCompletePricing(LISTING_ID)).toBe(false);
    });
  });
});
