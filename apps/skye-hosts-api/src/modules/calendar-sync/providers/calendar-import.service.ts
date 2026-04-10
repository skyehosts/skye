import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Sentry from '@sentry/nestjs';
import { DataSource, Repository } from 'typeorm';
import { CalendarBlock, CalendarSync } from '../entities';
import {
  IcalParserService,
  type ParsedCalendarEvent,
} from './ical-parser.service';

const MAX_RESPONSE_SIZE = 1_000_000; // 1MB
const FETCH_TIMEOUT_MS = 10_000;
const MAX_CONSECUTIVE_FAILURES = 10;
const VERBOSE_LOGGING = !!process.env.CALENDAR_SYNC_VERBOSE_LOGGING;

class CalendarFetchError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'CalendarFetchError';
  }
}

@Injectable()
export class CalendarImportService {
  private readonly logger = new Logger(CalendarImportService.name);

  constructor(
    @InjectRepository(CalendarSync)
    private readonly calendarSyncRepo: Repository<CalendarSync>,
    @InjectRepository(CalendarBlock)
    private readonly calendarBlockRepo: Repository<CalendarBlock>,
    private readonly icalParserService: IcalParserService,
    private readonly dataSource: DataSource,
  ) {}

  async importSingleSync(sync: CalendarSync): Promise<CalendarSync> {
    if (!sync.importUrl) {
      return sync;
    }

    try {
      const icalText = await this.fetchIcal(sync.importUrl);
      const events = this.icalParserService.parse(icalText);

      // Check sync still exists before reconciling — it may have been deleted
      // by the user while we were fetching the iCal.
      const stillExists = await this.calendarSyncRepo.findOne({
        where: { id: sync.id },
        select: ['id'],
      });
      if (!stillExists) {
        if (VERBOSE_LOGGING)
          this.logger.debug(
            `Sync ${sync.id} was deleted during import, skipping reconciliation`,
          );
        return sync;
      }

      await this.reconcileBlocks(sync.id, sync.listingId, events);

      sync.lastImportAt = new Date();
      sync.lastImportStatus = 'success';
      sync.lastImportError = null;
      sync.lastImportEventCount = events.length;
      sync.consecutiveFailures = 0;

      if (VERBOSE_LOGGING)
        this.logger.debug(
          `Import success for sync ${sync.id} (listing ${sync.listingId}): ${events.length} events`,
        );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const transient = this.isTransientError(error);

      sync.lastImportAt = new Date();
      sync.lastImportStatus = 'error';
      sync.lastImportError = errorMessage;

      if (transient) {
        this.logger.error(
          `Transient import error for sync ${sync.id} (listing ${sync.listingId}), consecutive failures unchanged at ${sync.consecutiveFailures}: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );
      } else {
        sync.consecutiveFailures += 1;

        this.logger.error(
          `Import failed for sync ${sync.id} (listing ${sync.listingId}): ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
        );

        if (sync.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          this.logger.error(
            `Auto-disabled import for sync ${sync.id} after ${MAX_CONSECUTIVE_FAILURES} consecutive permanent failures`,
          );
          Sentry.captureMessage(
            `Calendar sync auto-disabled: sync ${sync.id}, listing ${sync.listingId}, platform ${sync.platform}`,
            'warning',
          );
        }
      }

      Sentry.captureException(error, {
        tags: {
          calendarSyncId: sync.id,
          listingId: sync.listingId,
          platform: sync.platform,
          errorType: transient ? 'transient' : 'permanent',
        },
      });
    }

    // Final check: sync may have been deleted during import (race with user
    // delete). Using `update` instead of `save` avoids resurrecting a deleted row.
    await this.calendarSyncRepo.update(sync.id, {
      lastImportAt: sync.lastImportAt,
      lastImportStatus: sync.lastImportStatus,
      lastImportError: sync.lastImportError,
      lastImportEventCount: sync.lastImportEventCount,
      consecutiveFailures: sync.consecutiveFailures,
    });

    return sync;
  }

  /**
   * Returns true for infrastructure/transient failures that should not count
   * toward the auto-disable threshold (e.g. platform temporarily down, rate
   * limited, network timeout). Returns false for permanent failures that
   * indicate a bad URL or misconfiguration (e.g. 404, 401, parse error).
   */
  private isTransientError(error: unknown): boolean {
    // Timeout (AbortController fires)
    if (error instanceof Error && error.name === 'AbortError') return true;
    // HTTP errors: 5xx (server error) and 429 (rate limited) are transient
    if (error instanceof CalendarFetchError) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }
    // Network-level errors (ECONNREFUSED, ENOTFOUND, etc.) surface as TypeError
    // from the fetch API — treat as transient infrastructure issues
    if (error instanceof TypeError) return true;
    // Everything else (parse errors, size errors, 4xx) is permanent
    return false;
  }

  private async fetchIcal(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SkyeHosts/1.0 Calendar Sync' },
      });

      if (!response.ok) {
        throw new CalendarFetchError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
        throw new Error(
          `Response too large: ${contentLength} bytes (max ${MAX_RESPONSE_SIZE})`,
        );
      }

      const text = await response.text();

      if (text.length > MAX_RESPONSE_SIZE) {
        throw new Error(
          `Response body too large: ${text.length} chars (max ${MAX_RESPONSE_SIZE})`,
        );
      }

      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async reconcileBlocks(
    calendarSyncId: number,
    listingId: number,
    events: ParsedCalendarEvent[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.find(CalendarBlock, {
        where: { calendarSyncId },
      });

      const existingByUid = new Map<string, CalendarBlock>();
      for (const block of existing) {
        if (block.externalUid) {
          existingByUid.set(block.externalUid, block);
        }
      }

      const incomingByUid = new Map<string, ParsedCalendarEvent>();
      for (const event of events) {
        incomingByUid.set(event.uid, event);
      }

      // Determine inserts, updates, deletes
      const toInsert: ParsedCalendarEvent[] = [];
      const toUpdate: { block: CalendarBlock; event: ParsedCalendarEvent }[] =
        [];
      const toDeleteIds: number[] = [];

      for (const event of events) {
        const existingBlock = existingByUid.get(event.uid);
        if (!existingBlock) {
          toInsert.push(event);
        } else if (
          existingBlock.startDate !== event.startDate ||
          existingBlock.endDate !== event.endDate
        ) {
          toUpdate.push({ block: existingBlock, event });
        }
      }

      for (const block of existing) {
        if (block.externalUid && !incomingByUid.has(block.externalUid)) {
          toDeleteIds.push(block.id);
        }
      }

      // Execute changes
      if (toDeleteIds.length > 0) {
        await queryRunner.manager.delete(CalendarBlock, toDeleteIds);
      }

      for (const { block, event } of toUpdate) {
        await queryRunner.manager.update(CalendarBlock, block.id, {
          startDate: event.startDate,
          endDate: event.endDate,
          summary: event.summary,
        });
      }

      if (toInsert.length > 0) {
        const newBlocks = toInsert.map((event) =>
          queryRunner.manager.create(CalendarBlock, {
            listingId,
            calendarSyncId,
            source: 'import' as const,
            startDate: event.startDate,
            endDate: event.endDate,
            summary: event.summary,
            externalUid: event.uid,
          }),
        );
        await queryRunner.manager.save(CalendarBlock, newBlocks);
      }

      await queryRunner.commitTransaction();

      if (VERBOSE_LOGGING)
        this.logger.debug(
          `Reconciled sync ${calendarSyncId}: +${toInsert.length} ~${toUpdate.length} -${toDeleteIds.length}`,
        );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
