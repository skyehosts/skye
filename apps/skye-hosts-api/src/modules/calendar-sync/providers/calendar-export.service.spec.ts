import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../../booking/entities/booking.entity';
import { Listing } from '../../listing/entities';
import { CalendarBlock, CalendarSync } from '../entities';
import { CalendarExportService } from './calendar-export.service';

const makeSyncRepo = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
});

const makeBlockRepo = () => ({
  find: jest.fn(),
});

const makeBookingRepo = () => ({
  find: jest.fn(),
});

const makeListingRepo = () => ({
  findOne: jest.fn(),
});

describe('CalendarExportService', () => {
  let service: CalendarExportService;
  let calendarSyncRepo: ReturnType<typeof makeSyncRepo>;
  let calendarBlockRepo: ReturnType<typeof makeBlockRepo>;
  let bookingRepo: ReturnType<typeof makeBookingRepo>;
  let listingRepo: ReturnType<typeof makeListingRepo>;

  beforeEach(async () => {
    calendarSyncRepo = makeSyncRepo();
    calendarBlockRepo = makeBlockRepo();
    bookingRepo = makeBookingRepo();
    listingRepo = makeListingRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarExportService,
        {
          provide: getRepositoryToken(CalendarSync),
          useValue: calendarSyncRepo,
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
          provide: getRepositoryToken(Listing),
          useValue: listingRepo,
        },
      ],
    }).compile();

    service = module.get(CalendarExportService);
  });

  const mockSync = {
    id: 1,
    listingId: 10,
    exportToken: 'test-token-123',
  };

  const mockListing = {
    id: 10,
    title: 'Highland Cottage',
  };

  it('should return null for unknown export token', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(null);

    const result = await service.generateIcal('nonexistent');

    expect(result).toBeNull();
  });

  it('should generate valid VCALENDAR structure', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([]);

    const result = await service.generateIcal('test-token-123');

    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('PRODID:-//Skye Hosts//Calendar//EN');
    expect(result).toContain('METHOD:PUBLISH');
    expect(result).toContain('X-WR-CALNAME:Highland Cottage');
    expect(result).toContain('END:VCALENDAR');
  });

  it('should include bookings as VEVENTs with "Reserved" summary (no PII)', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([
      {
        id: 42,
        checkInDate: '2027-06-01',
        checkOutDate: '2027-06-05',
      },
    ]);
    calendarBlockRepo.find.mockResolvedValue([]);

    const result = await service.generateIcal('test-token-123');

    expect(result).toContain('BEGIN:VEVENT');
    expect(result).toContain('UID:skye-booking-42@skyehosts.com');
    expect(result).toContain('DTSTART;VALUE=DATE:20270601');
    expect(result).toContain('DTEND;VALUE=DATE:20270605');
    expect(result).toContain('SUMMARY:Reserved');
    expect(result).not.toContain('Guest');
  });

  it('should include blocks as VEVENTs', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([
      {
        id: 99,
        startDate: '2027-07-10',
        endDate: '2027-07-15',
        summary: 'Airbnb',
      },
    ]);

    const result = await service.generateIcal('test-token-123');

    expect(result).toContain('UID:skye-block-99@skyehosts.com');
    expect(result).toContain('DTSTART;VALUE=DATE:20270710');
    expect(result).toContain('DTEND;VALUE=DATE:20270715');
    expect(result).toContain('SUMMARY:Airbnb');
  });

  it('should use "Blocked" as default summary when block has no summary', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([
      {
        id: 100,
        startDate: '2027-08-01',
        endDate: '2027-08-05',
        summary: null,
      },
    ]);

    const result = await service.generateIcal('test-token-123');

    expect(result).toContain('SUMMARY:Blocked');
  });

  it('should escape special characters in listing title', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue({
      ...mockListing,
      title: 'Cozy; Cabin, with\\views',
    });
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([]);

    const result = await service.generateIcal('test-token-123');

    expect(result).toContain('X-WR-CALNAME:Cozy\\; Cabin\\, with\\\\views');
  });

  it('should only query imported blocks, excluding manual blocks from export', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([]);

    await service.generateIcal('test-token-123');

    const [opts] = calendarBlockRepo.find.mock.calls[0];
    expect(opts.where.source).toBe('import');
    expect(opts.where.listingId).toBe(10);
  });

  it('should record lastExportedAt after a successful export', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([]);

    await service.generateIcal('test-token-123');

    expect(calendarSyncRepo.update).toHaveBeenCalledWith(
      mockSync.id,
      expect.objectContaining({ lastExportedAt: expect.any(Date) }),
    );
  });

  it('should not record lastExportedAt when sync is not found', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(null);

    await service.generateIcal('nonexistent');

    expect(calendarSyncRepo.update).not.toHaveBeenCalled();
  });

  it('should use CRLF line endings per RFC 5545', async () => {
    calendarSyncRepo.findOne.mockResolvedValue(mockSync);
    listingRepo.findOne.mockResolvedValue(mockListing);
    bookingRepo.find.mockResolvedValue([]);
    calendarBlockRepo.find.mockResolvedValue([]);

    const result = await service.generateIcal('test-token-123');

    // Lines should be joined with \r\n
    expect(result).toContain('\r\n');
    // Should not contain bare \n without preceding \r
    const withoutCrlf = result.replace(/\r\n/g, '');
    expect(withoutCrlf).not.toContain('\n');
  });
});
