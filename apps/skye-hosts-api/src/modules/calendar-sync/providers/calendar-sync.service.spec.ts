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
  let syncRepo: ReturnType<typeof makeSyncRepo>;
  let calendarBlockRepo: ReturnType<typeof makeBlockRepo>;
  let bookingRepo: ReturnType<typeof makeBookingRepo>;

  beforeEach(async () => {
    syncRepo = makeSyncRepo();
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

    it('should scope block query to the given listingId with a future endDate filter', async () => {
      calendarBlockRepo.find.mockResolvedValue([]);
      bookingRepo.find.mockResolvedValue([]);

      await service.getUnavailabilityForListing(42);

      const [opts] = calendarBlockRepo.find.mock.calls[0];
      expect(opts.where.listingId).toBe(42);
      expect(opts.where.endDate).toBeDefined(); // MoreThanOrEqual operator present
    });

    it('should scope booking query to listingId, future checkOutDate, and confirmed/pending status', async () => {
      calendarBlockRepo.find.mockResolvedValue([]);
      bookingRepo.find.mockResolvedValue([]);

      await service.getUnavailabilityForListing(42);

      const [opts] = bookingRepo.find.mock.calls[0];
      expect(opts.where.listingId).toBe(42);
      expect(opts.where.checkOutDate).toBeDefined(); // MoreThanOrEqual operator present
      expect(opts.where.status).toBeDefined(); // In(['confirmed', 'pending']) operator present
    });
  });

  // ── unblockRange ─────────────────────────────────────────────────────────────

  describe('unblockRange', () => {
    let mockBlockRepo: {
      createQueryBuilder: jest.Mock;
      find: jest.Mock;
      delete: jest.Mock;
      create: jest.Mock;
      save: jest.Mock;
    };
    let mockQueryBuilder: {
      where: jest.Mock;
      andWhere: jest.Mock;
      getMany: jest.Mock;
    };

    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockBlockRepo = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockImplementation((entity) => entity),
        save: jest.fn().mockResolvedValue(undefined),
      };

      const dataSource = service['dataSource'] as unknown as {
        transaction: jest.Mock;
      };
      dataSource.transaction = jest
        .fn()
        .mockImplementation((cb) => cb({ getRepository: () => mockBlockRepo }));
    });

    function makeBlock(
      overrides: Partial<{
        id: number;
        listingId: number;
        source: string;
        startDate: string;
        endDate: string;
      }> = {},
    ) {
      return {
        id: 1,
        listingId: 10,
        source: 'manual',
        startDate: '2027-06-01',
        endDate: '2027-06-30',
        calendarSyncId: null,
        externalUid: null,
        summary: null,
        ...overrides,
      };
    }

    it('should return existing blocks when no overlapping manual blocks found', async () => {
      const allBlocks = [makeBlock({ id: 5, source: 'import' })];
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockBlockRepo.find.mockResolvedValue(allBlocks);

      const result = await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(result).toEqual(allBlocks);
      expect(mockBlockRepo.delete).not.toHaveBeenCalled();
      expect(mockBlockRepo.save).not.toHaveBeenCalled();
    });

    it('should delete a block fully inside the unblock range', async () => {
      const block = makeBlock({
        id: 1,
        startDate: '2027-06-10',
        endDate: '2027-06-15',
      });
      mockQueryBuilder.getMany.mockResolvedValue([block]);
      mockBlockRepo.find.mockResolvedValue([]);

      await service.unblockRange(10, '2027-06-01', '2027-06-30');

      expect(mockBlockRepo.delete).toHaveBeenCalledWith([1]);
      // No trimmed blocks needed — block fully contained
      expect(mockBlockRepo.save).not.toHaveBeenCalled();
    });

    it('should split a block when unblocking a sub-range', async () => {
      const block = makeBlock({
        id: 1,
        startDate: '2027-06-01',
        endDate: '2027-06-30',
      });
      mockQueryBuilder.getMany.mockResolvedValue([block]);
      mockBlockRepo.find.mockResolvedValue([]);

      await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(mockBlockRepo.delete).toHaveBeenCalledWith([1]);
      expect(mockBlockRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({
          listingId: 10,
          source: 'manual',
          startDate: '2027-06-01',
          endDate: '2027-06-10',
        }),
        expect.objectContaining({
          listingId: 10,
          source: 'manual',
          startDate: '2027-06-20',
          endDate: '2027-06-30',
        }),
      ]);
    });

    it('should trim the end when unblock range overlaps the start of a block', async () => {
      const block = makeBlock({
        id: 1,
        startDate: '2027-06-15',
        endDate: '2027-06-30',
      });
      mockQueryBuilder.getMany.mockResolvedValue([block]);
      mockBlockRepo.find.mockResolvedValue([]);

      await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(mockBlockRepo.delete).toHaveBeenCalledWith([1]);
      expect(mockBlockRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({
          startDate: '2027-06-20',
          endDate: '2027-06-30',
        }),
      ]);
    });

    it('should trim the start when unblock range overlaps the end of a block', async () => {
      const block = makeBlock({
        id: 1,
        startDate: '2027-06-01',
        endDate: '2027-06-15',
      });
      mockQueryBuilder.getMany.mockResolvedValue([block]);
      mockBlockRepo.find.mockResolvedValue([]);

      await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(mockBlockRepo.delete).toHaveBeenCalledWith([1]);
      expect(mockBlockRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({
          startDate: '2027-06-01',
          endDate: '2027-06-10',
        }),
      ]);
    });

    it('should handle multiple overlapping blocks', async () => {
      const blocks = [
        makeBlock({ id: 1, startDate: '2027-06-01', endDate: '2027-06-12' }),
        makeBlock({ id: 2, startDate: '2027-06-18', endDate: '2027-06-30' }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(blocks);
      mockBlockRepo.find.mockResolvedValue([]);

      await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(mockBlockRepo.delete).toHaveBeenCalledWith([1, 2]);
      expect(mockBlockRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({
          startDate: '2027-06-01',
          endDate: '2027-06-10',
        }),
        expect.objectContaining({
          startDate: '2027-06-20',
          endDate: '2027-06-30',
        }),
      ]);
    });

    it('should return updated blocks list after unblocking', async () => {
      const block = makeBlock({ id: 1 });
      mockQueryBuilder.getMany.mockResolvedValue([block]);
      const updatedBlocks = [
        makeBlock({ id: 2, startDate: '2027-06-01', endDate: '2027-06-10' }),
      ];
      mockBlockRepo.find.mockResolvedValue(updatedBlocks);

      const result = await service.unblockRange(10, '2027-06-10', '2027-06-20');

      expect(result).toEqual(updatedBlocks);
    });
  });

  // ── updateSync ──────────────────────────────────────────────────────────────

  describe('updateSync', () => {
    function makeExistingSync(
      overrides: Partial<{
        consecutiveFailures: number;
        importUrl: string | null;
        lastImportError: string | null;
      }> = {},
    ) {
      return {
        id: 1,
        importUrl: null,
        consecutiveFailures: 0,
        lastImportError: null,
        ...overrides,
      };
    }

    it('should reset failures when URL updated and sync was auto-disabled', async () => {
      const existing = makeExistingSync({
        consecutiveFailures: 10,
        lastImportError: 'HTTP 404: Not Found',
      });
      syncRepo.findOne.mockResolvedValue(existing);
      syncRepo.save.mockImplementation((s) => Promise.resolve(s));

      await service.updateSync(1, {
        importUrl: 'https://example.com/new.ics',
      });

      expect(existing.consecutiveFailures).toBe(0);
      expect(existing.lastImportError).toBeNull();
    });

    it('should not reset failures when URL is updated but failures are below threshold', async () => {
      const existing = makeExistingSync({ consecutiveFailures: 5 });
      syncRepo.findOne.mockResolvedValue(existing);
      syncRepo.save.mockImplementation((s) => Promise.resolve(s));

      await service.updateSync(1, {
        importUrl: 'https://example.com/new.ics',
      });

      expect(existing.consecutiveFailures).toBe(5); // unchanged
    });

    it('should not reset failures when importUrl is not provided even with failures at threshold', async () => {
      const existing = makeExistingSync({
        consecutiveFailures: 10,
      });
      syncRepo.findOne.mockResolvedValue(existing);
      syncRepo.save.mockImplementation((s) => Promise.resolve(s));

      await service.updateSync(1, { label: 'test' });

      expect(existing.consecutiveFailures).toBe(10); // unchanged
    });
  });
});
