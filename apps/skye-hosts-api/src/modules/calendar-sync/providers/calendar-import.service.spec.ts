import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as Sentry from '@sentry/nestjs';
import { DataSource } from 'typeorm';
import { CalendarBlock, CalendarSync } from '../entities';
import { CalendarImportService } from './calendar-import.service';
import { IcalParserService } from './ical-parser.service';

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvent(
  uid: string,
  startDate = '2027-06-01',
  endDate = '2027-06-05',
) {
  return { uid, startDate, endDate, summary: 'Reserved' };
}

function makeBlock(overrides: Partial<CalendarBlock> = {}): CalendarBlock {
  return {
    id: 1,
    listingId: 10,
    calendarSyncId: 99,
    source: 'import',
    externalUid: 'uid-1',
    startDate: '2027-06-01',
    endDate: '2027-06-05',
    summary: 'Reserved',
    ...overrides,
  } as CalendarBlock;
}

function makeSync(overrides: Partial<CalendarSync> = {}): CalendarSync {
  return {
    id: 99,
    listingId: 10,
    importUrl: 'https://example.com/cal.ics',
    consecutiveFailures: 0,
    lastImportStatus: null,
    lastImportError: null,
    lastImportAt: null,
    lastImportEventCount: null,
    ...overrides,
  } as unknown as CalendarSync;
}

// ── Mock factories ─────────────────────────────────────────────────────────────

function makeManager(blocks: CalendarBlock[] = []) {
  return {
    find: jest.fn().mockResolvedValue(blocks),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    create: jest
      .fn()
      .mockImplementation((_entity: unknown, data: unknown) => data),
    save: jest.fn().mockResolvedValue(undefined),
  };
}

function makeQueryRunner(blocks: CalendarBlock[] = []) {
  const manager = makeManager(blocks);
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager,
  };
}

function makeSyncRepo(sync: CalendarSync | null = null) {
  return {
    findOne: jest.fn().mockResolvedValue(sync),
    update: jest.fn().mockResolvedValue(undefined),
  };
}

function makeBlockRepo() {
  // CalendarImportService injects CalendarBlock repo but accesses it only via
  // queryRunner.manager. The repo itself is unused; an empty mock satisfies DI.
  return {};
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CalendarImportService', () => {
  let service: CalendarImportService;
  let syncRepo: ReturnType<typeof makeSyncRepo>;
  let blockRepo: ReturnType<typeof makeBlockRepo>;
  let queryRunner: ReturnType<typeof makeQueryRunner>;
  let dataSource: { createQueryRunner: jest.Mock };
  let icalParser: { parse: jest.Mock };

  beforeEach(async () => {
    queryRunner = makeQueryRunner();
    syncRepo = makeSyncRepo({ id: 99 } as CalendarSync);
    blockRepo = makeBlockRepo();
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    icalParser = { parse: jest.fn().mockReturnValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarImportService,
        { provide: getRepositoryToken(CalendarSync), useValue: syncRepo },
        { provide: getRepositoryToken(CalendarBlock), useValue: blockRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: IcalParserService, useValue: icalParser },
      ],
    }).compile();

    service = module.get(CalendarImportService);
    jest.clearAllMocks();
    // Re-wire mocks after clearAllMocks
    syncRepo.findOne.mockResolvedValue({ id: 99 });
    syncRepo.update.mockResolvedValue(undefined);
    dataSource.createQueryRunner.mockReturnValue(queryRunner);
    queryRunner.connect.mockResolvedValue(undefined);
    queryRunner.startTransaction.mockResolvedValue(undefined);
    queryRunner.commitTransaction.mockResolvedValue(undefined);
    queryRunner.rollbackTransaction.mockResolvedValue(undefined);
    queryRunner.release.mockResolvedValue(undefined);
    queryRunner.manager.find.mockResolvedValue([]);
    queryRunner.manager.update.mockResolvedValue(undefined);
    queryRunner.manager.delete.mockResolvedValue(undefined);
    queryRunner.manager.create.mockImplementation(
      (_: unknown, d: unknown) => d,
    );
    queryRunner.manager.save.mockResolvedValue(undefined);
    icalParser.parse.mockReturnValue([]);
  });

  // ── isTransientError ────────────────────────────────────────────────────────

  describe('error categorisation (via importSingleSync)', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    });

    it('should not increment consecutiveFailures for a 503 (transient)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });
      const sync = makeSync({ consecutiveFailures: 2 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(2); // unchanged
    });

    it('should not increment consecutiveFailures for a 429 (rate limited)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });
      const sync = makeSync({ consecutiveFailures: 3 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(3);
    });

    it('should not increment consecutiveFailures for a timeout (AbortError)', async () => {
      const abortError = Object.assign(new Error('The operation was aborted'), {
        name: 'AbortError',
      });
      mockFetch.mockRejectedValue(abortError);
      const sync = makeSync({ consecutiveFailures: 1 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(1);
    });

    it('should not increment consecutiveFailures for a network error (TypeError)', async () => {
      mockFetch.mockRejectedValue(new TypeError('fetch failed'));
      const sync = makeSync({ consecutiveFailures: 0 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(0);
    });

    it('should increment consecutiveFailures for a 404 (permanent)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      const sync = makeSync({ consecutiveFailures: 0 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(1);
    });

    it('should increment consecutiveFailures for a 401 (permanent)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });
      const sync = makeSync({ consecutiveFailures: 4 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(5);
    });

    it('should log auto-disable after 10 consecutive permanent failures', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      const sync = makeSync({ consecutiveFailures: 9 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(10);
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        expect.stringContaining('auto-disabled'),
        'warning',
      );
    });

    it('should not increment failures on transient errors even at high failure counts', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });
      const sync = makeSync({ consecutiveFailures: 9 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(9);
    });

    it('should reset consecutiveFailures to 0 on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: jest.fn().mockReturnValue(null) },
        text: jest
          .fn()
          .mockResolvedValue('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR'),
      });
      icalParser.parse.mockReturnValue([]);
      const sync = makeSync({ consecutiveFailures: 7 });

      await service.importSingleSync(sync);

      expect(sync.consecutiveFailures).toBe(0);
      expect(sync.lastImportStatus).toBe('success');
    });

    it('should record lastImportError for all failure types', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });
      const sync = makeSync();

      await service.importSingleSync(sync);

      expect(sync.lastImportStatus).toBe('error');
      expect(sync.lastImportError).toContain('503');
    });
  });

  // ── reconcileBlocks ─────────────────────────────────────────────────────────

  describe('reconcileBlocks', () => {
    it('should insert new events as blocks', async () => {
      queryRunner.manager.find.mockResolvedValue([]);
      const events = [makeEvent('new-uid')];

      await service['reconcileBlocks'](99, 10, events);

      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should delete existing blocks whose UID is no longer in the feed', async () => {
      const existingBlock = makeBlock({ externalUid: 'removed-uid' });
      queryRunner.manager.find.mockResolvedValue([existingBlock]);

      await service['reconcileBlocks'](99, 10, []); // empty feed

      expect(queryRunner.manager.delete).toHaveBeenCalledWith(CalendarBlock, [
        existingBlock.id,
      ]);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should update blocks whose dates have changed', async () => {
      const existingBlock = makeBlock({
        externalUid: 'uid-1',
        startDate: '2027-06-01',
        endDate: '2027-06-05',
      });
      queryRunner.manager.find.mockResolvedValue([existingBlock]);
      const events = [makeEvent('uid-1', '2027-06-10', '2027-06-15')]; // changed dates

      await service['reconcileBlocks'](99, 10, events);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        CalendarBlock,
        existingBlock.id,
        expect.objectContaining({
          startDate: '2027-06-10',
          endDate: '2027-06-15',
        }),
      );
    });

    it('should make no changes when events match existing blocks exactly', async () => {
      const existingBlock = makeBlock({ externalUid: 'uid-1' });
      queryRunner.manager.find.mockResolvedValue([existingBlock]);
      const events = [makeEvent('uid-1', '2027-06-01', '2027-06-05')]; // same dates

      await service['reconcileBlocks'](99, 10, events);

      expect(queryRunner.manager.update).not.toHaveBeenCalled();
      expect(queryRunner.manager.delete).not.toHaveBeenCalled();
      expect(queryRunner.manager.save).not.toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      queryRunner.manager.find.mockRejectedValue(new Error('DB error'));

      await expect(service['reconcileBlocks'](99, 10, [])).rejects.toThrow(
        'DB error',
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should always release the query runner even on error', async () => {
      queryRunner.manager.find.mockRejectedValue(new Error('DB error'));

      await expect(service['reconcileBlocks'](99, 10, [])).rejects.toThrow();

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  // ── importSingleSync skips when sync deleted mid-flight ─────────────────────

  describe('importSingleSync', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: { get: jest.fn().mockReturnValue(null) },
        text: jest
          .fn()
          .mockResolvedValue('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR'),
      });
      global.fetch = mockFetch;
    });

    it('should skip reconciliation if sync was deleted during import', async () => {
      // findOne returns null → sync was deleted while fetch was in-flight
      syncRepo.findOne.mockResolvedValue(null);
      icalParser.parse.mockReturnValue([makeEvent('uid-1')]);
      const sync = makeSync();

      await service.importSingleSync(sync);

      expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should skip import entirely when importUrl is null', async () => {
      const sync = makeSync({ importUrl: null });

      const result = await service.importSingleSync(sync);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toBe(sync);
    });
  });
});
