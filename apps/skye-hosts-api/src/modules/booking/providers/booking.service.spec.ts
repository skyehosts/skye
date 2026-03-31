import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ScheduledMessageCreationService } from '../../scheduled-message/providers/scheduled-message-creation.service';
import { Booking } from '../entities';
import { BookingService } from './booking.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BookingService', () => {
  let service: BookingService;
  let dataSource: { transaction: jest.Mock };
  let scheduledMessageCreationService: { createForBooking: jest.Mock };

  beforeEach(async () => {
    dataSource = {
      transaction: jest.fn(),
    };

    scheduledMessageCreationService = {
      createForBooking: jest.fn().mockResolvedValue(undefined),
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
      ],
    }).compile();

    service = module.get(BookingService);
  });

  describe('createBooking', () => {
    it('should save a booking with status confirmed and call createForBooking', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn().mockResolvedValue(saved),
          findOne: jest.fn().mockResolvedValue(withListing),
        }),
      };
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
        undefined, // isTestBooking not passed
        mockManager,
      );
    });

    it('should forward isTestBooking to createForBooking', async () => {
      const saved = makeSavedBooking();
      const withListing = makeBookingWithListing(saved);

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn().mockResolvedValue(saved),
          findOne: jest.fn().mockResolvedValue(withListing),
        }),
      };
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

      const mockManager = {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn().mockResolvedValue(saved),
          findOne: jest.fn().mockResolvedValue(withListing),
        }),
      };
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
  });
});
