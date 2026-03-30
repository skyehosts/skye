import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { ListingAccessService } from '../../co-host/providers';
import { ConfigService } from '../../config/providers/config.service';
import { CalendarBlock, CalendarSync } from '../entities';
import { CalendarSyncService } from './calendar-sync.service';

const makeSyncRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((entity) => entity),
  save: jest.fn().mockImplementation((entity) => ({ id: 1, ...entity })),
  delete: jest.fn(),
});

const makeBlockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((entity) => entity),
  save: jest.fn().mockImplementation((entity) => ({ id: 1, ...entity })),
  delete: jest.fn(),
});

const makeBookingRepo = () => ({
  find: jest.fn(),
});

describe('CalendarSyncService', () => {
  let service: CalendarSyncService;
  let calendarBlockRepo: ReturnType<typeof makeBlockRepo>;
  let bookingRepo: ReturnType<typeof makeBookingRepo>;

  beforeEach(async () => {
    const syncRepo = makeSyncRepo();
    calendarBlockRepo = makeBlockRepo();
    bookingRepo = makeBookingRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarSyncService,
        {
          provide: getRepositoryToken(CalendarSync),
          useValue: syncRepo,
        },
        {
          provide: getRepositoryToken(CalendarBlock),
          useValue: calendarBlockRepo,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: bookingRepo,
        },
        {
          provide: ListingAccessService,
          useValue: { hasPermission: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            getAll: () => ({ apiBaseUrl: 'http://localhost:3000' }),
          },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CalendarSyncService);
  });

  describe('getUnavailabilityForListing', () => {
    it('should return empty array when no blocks or bookings exist', async () => {
      calendarBlockRepo.find.mockResolvedValue([]);
      bookingRepo.find.mockResolvedValue([]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([]);
    });

    it('should return blocks as unavailable ranges', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-05' },
      ]);
      bookingRepo.find.mockResolvedValue([]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-05' },
      ]);
    });

    it('should return bookings as unavailable ranges', async () => {
      calendarBlockRepo.find.mockResolvedValue([]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-07-10', checkOutDate: '2027-07-15' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-07-10', endDate: '2027-07-15' },
      ]);
    });

    it('should merge overlapping ranges from blocks and bookings', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-10' },
      ]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-06-08', checkOutDate: '2027-06-15' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-15' },
      ]);
    });

    it('should merge adjacent ranges', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-05' },
        { startDate: '2027-06-05', endDate: '2027-06-10' },
      ]);
      bookingRepo.find.mockResolvedValue([]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-10' },
      ]);
    });

    it('should keep non-overlapping ranges separate', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-05' },
      ]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-07-10', checkOutDate: '2027-07-15' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-05' },
        { startDate: '2027-07-10', endDate: '2027-07-15' },
      ]);
    });

    it('should sort ranges by startDate regardless of source order', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-08-01', endDate: '2027-08-05' },
      ]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-06-10', checkOutDate: '2027-06-15' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-10', endDate: '2027-06-15' },
        { startDate: '2027-08-01', endDate: '2027-08-05' },
      ]);
    });

    it('should merge multiple overlapping ranges into one', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-10' },
        { startDate: '2027-06-08', endDate: '2027-06-20' },
      ]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-06-15', checkOutDate: '2027-06-25' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-25' },
      ]);
    });

    it('should handle a range fully contained within another', async () => {
      calendarBlockRepo.find.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-06-30' },
      ]);
      bookingRepo.find.mockResolvedValue([
        { checkInDate: '2027-06-10', checkOutDate: '2027-06-15' },
      ]);

      const result = await service.getUnavailabilityForListing(1);

      expect(result).toEqual([
        { startDate: '2027-06-01', endDate: '2027-06-30' },
      ]);
    });
  });
});
