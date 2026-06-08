import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ListingPricingService } from '../../listing/providers/listing-pricing.service';
import { ScheduledMessageCreationService } from '../../scheduled-message/providers/scheduled-message-creation.service';
import { Booking } from '../entities';
import { BookingService } from './booking.service';

function makeParams(
  overrides: Partial<Parameters<BookingService['createBooking']>[0]> = {},
) {
  return {
    listingId: 10,
    guestId: 5,
    checkInDate: '2027-08-01',
    checkOutDate: '2027-08-07',
    totalPrice: 600,
    numberOfGuests: 2,
    ...overrides,
  };
}

function makeSavedBooking(id = 1) {
  return {
    id,
    listingId: 10,
    guestId: 5,
    checkInDate: '2027-08-01',
    checkOutDate: '2027-08-07',
    totalPrice: 600,
    numberOfGuests: 2,
    status: 'confirmed',
    createdAt: new Date(),
  } as Booking;
}

function makeBookingWithListing(booking: Booking) {
  return {
    ...booking,
    listing: { id: booking.listingId, hostId: 99, title: 'Test Listing' },
  };
}

function makeMockManager(
  saved: Booking,
  withListing: ReturnType<typeof makeBookingWithListing>,
  overrides: { save?: jest.Mock; findOne?: jest.Mock; delete?: jest.Mock } = {},
) {
  const save = overrides.save ?? jest.fn().mockResolvedValue(saved);
  const findOne = overrides.findOne ?? jest.fn().mockResolvedValue(withListing);
  return {
    getRepository: jest.fn().mockReturnValue({ save, findOne }),
    save,
    findOne,
  };
}

describe('BookingService', () => {
  let service: BookingService;
  let dataSource: { transaction: jest.Mock };
  let scheduledMessageCreationService: { createForBooking: jest.Mock };
  let listingPricingService: { getBreakdownForBooking: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn(),
    };

    scheduledMessageCreationService = {
      createForBooking: jest.fn().mockResolvedValue(undefined),
    };

    listingPricingService = {
      getBreakdownForBooking: jest
        .fn()
        .mockRejectedValue(new Error('pricing not configured in tests')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getRepositoryToken(Booking), useValue: {} },
        { provide: DataSource, useValue: dataSource },
        {
          provide: ScheduledMessageCreationService,
          useValue: scheduledMessageCreationService,
        },
        {
          provide: ListingPricingService,
          useValue: listingPricingService,
        },
      ],
    }).compile();

    service = module.get(BookingService);
  });

  describe('createBooking', () => {
    it('should save a booking with status confirmed and call createForBooking', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);
      const mockManager = makeMockManager(saved, withListing);
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<Booking>) => cb(mockManager),
      );

      const result = await service.createBooking(makeParams());

      expect(result.status).toBe('confirmed');
      expect(result.id).toBe(saved.id);
      expect(
        scheduledMessageCreationService.createForBooking,
      ).toHaveBeenCalledWith(
        saved,
        withListing.listing,
        undefined,
        mockManager,
      );
    });

    it('should forward isTestBooking to createForBooking', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);
      const mockManager = makeMockManager(saved, withListing);
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<Booking>) => cb(mockManager),
      );

      await service.createBooking(makeParams({ isTestBooking: true }));

      expect(
        scheduledMessageCreationService.createForBooking,
      ).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        true,
        mockManager,
      );
    });

    it('should propagate the error and not return a booking when createForBooking throws', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);
      const mockManager = makeMockManager(saved, withListing);
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<Booking>) => cb(mockManager),
      );
      scheduledMessageCreationService.createForBooking.mockRejectedValue(
        new Error('DB error in createForBooking'),
      );

      await expect(service.createBooking(makeParams())).rejects.toThrow(
        'DB error in createForBooking',
      );
    });

    it('persists the pricing breakdown and overrides totalPrice with the computed total', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);
      const mockManager = makeMockManager(saved, withListing);
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<Booking>) => cb(mockManager),
      );

      const breakdown = {
        nights: [],
        nightlyRateSumPence: 24000,
        extraGuestTotalPence: 0,
        cleaningFeePound: 1,
        hostNetSubtotalPence: 24100,
        appliedDiscounts: [],
        discountedHostNetPence: 24100,
        guestFeePence: 723,
        guestFeeRate: 0.03,
        hostFeePence: 723,
        stripeFeePence: 766,
        totalGuestPence: 26312,
        hostPayoutPence: 24100,
        currency: 'GBP' as const,
      };
      listingPricingService.getBreakdownForBooking.mockResolvedValue(breakdown);

      await service.createBooking(
        makeParams({ checkInDate: '2027-07-05', checkOutDate: '2027-07-07' }),
      );

      expect(listingPricingService.getBreakdownForBooking).toHaveBeenCalledWith(
        10,
        '2027-07-05',
        '2027-07-07',
        { adults: 2, children: 0, babies: 0 },
        expect.any(Date),
      );
      const persisted = mockManager.save.mock.calls[0][0];
      expect(persisted.priceBreakdown).toBe(breakdown);
      expect(persisted.totalPrice).toBe(263.12);
    });

    it('persists priceBreakdown=null and falls back to supplied totalPrice when pricing throws', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);
      const mockManager = makeMockManager(saved, withListing);
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<Booking>) => cb(mockManager),
      );
      listingPricingService.getBreakdownForBooking.mockRejectedValue(
        new Error('pricing incomplete'),
      );

      await service.createBooking(makeParams({ totalPrice: 999 }));

      const persisted = mockManager.save.mock.calls[0][0];
      expect(persisted.priceBreakdown).toBeNull();
      expect(persisted.totalPrice).toBe(999);
    });
  });
});
