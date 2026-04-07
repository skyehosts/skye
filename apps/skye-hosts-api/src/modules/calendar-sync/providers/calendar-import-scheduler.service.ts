import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as Sentry from '@sentry/nestjs';
import { CronJob } from 'cron';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { CalendarSync } from '../entities';
import { CalendarImportService } from './calendar-import.service';

const CONCURRENCY = 20;
const PAGE_SIZE = 100;
const VERBOSE_LOGGING = !!process.env.CALENDAR_SYNC_VERBOSE_LOGGING;

@Injectable()
export class CalendarImportSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CalendarImportSchedulerService.name);

  constructor(
    @InjectRepository(CalendarSync)
    private readonly calendarSyncRepo: Repository<CalendarSync>,
    private readonly calendarImportService: CalendarImportService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const expression =
      process.env.SKYE_ENVIRONMENT === 'local'
        ? '0 */1 * * * *' // every 60s
        : '0 0 */3 * * *'; // every 3h

    const job = CronJob.from({
      cronTime: expression,
      onTick: () => this.pollAndImport(),
      start: true,
    });
    this.schedulerRegistry.addCronJob('calendar-sync-import', job);
    if (VERBOSE_LOGGING)
      this.logger.debug(`Calendar import poller registered (${expression})`);
  }

  async pollAndImport(): Promise<void> {
    if (VERBOSE_LOGGING) this.logger.debug('Calendar import poll started');
    const startTime = Date.now();

    try {
      let successCount = 0;
      let failureCount = 0;
      let skip = 0;

      // Paginate to cap memory and DB connection pressure

      while (true) {
        const page = await this.calendarSyncRepo.find({
          where: {
            importUrl: Not(IsNull()),
            consecutiveFailures: LessThan(10),
          },
          order: { lastImportAt: { direction: 'ASC', nulls: 'FIRST' } },
          take: PAGE_SIZE,
          skip,
        });

        if (page.length === 0) break;
        skip += page.length;

        // Process page in concurrent batches
        for (let i = 0; i < page.length; i += CONCURRENCY) {
          const batch = page.slice(i, i + CONCURRENCY);
          const results = await Promise.allSettled(
            batch.map((sync) =>
              this.calendarImportService.importSingleSync(sync),
            ),
          );

          for (const result of results) {
            if (result.status === 'fulfilled') {
              if (result.value.lastImportStatus === 'success') {
                successCount++;
              } else {
                failureCount++;
              }
            } else {
              failureCount++;
            }
          }
        }

        if (page.length < PAGE_SIZE) break;
      }

      const durationMs = Date.now() - startTime;
      if (VERBOSE_LOGGING)
        this.logger.debug(
          `Calendar import poll completed: ${successCount} success, ${failureCount} failed, ${durationMs}ms`,
        );

      if (durationMs > 30 * 60 * 1000) {
        this.logger.error(
          `Calendar import poll took ${Math.round(durationMs / 1000)}s, exceeding 30-minute threshold`,
        );
        Sentry.captureMessage(
          `Calendar import poll duration exceeded 30 minutes: ${Math.round(durationMs / 1000)}s`,
          'warning',
        );
      }
    } catch (error) {
      this.logger.error('Calendar import poll failed', error);
      Sentry.captureException(error);
    }
  }
}
