import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AwsQueueSendMessageService } from '../../queue/providers';
import { AwsQueueNames } from '../../queue/types';

const BATCH_SIZE = 50;
const STUCK_JOB_TIMEOUT_MINUTES = 5;

@Injectable()
export class ScheduledMessageSchedulerService {
  private readonly logger = new Logger(ScheduledMessageSchedulerService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queueService: AwsQueueSendMessageService,
  ) {}

  /** Production: every hour. Local: every 30 seconds. */
  @Cron(
    process.env.SKYE_ENVIRONMENT === 'local' ? '*/30 * * * * *' : '0 * * * *',
  )
  async pollAndDispatch(): Promise<void> {
    this.logger.debug('Scheduled message poll started');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let idsToDispatch: number[] = [];

    try {
      // Reset stuck processing jobs older than STUCK_JOB_TIMEOUT_MINUTES
      await queryRunner.query(`
        UPDATE scheduled_message
        SET status = 'pending', "lockedAt" = NULL, "lockedBy" = NULL, "updatedAt" = NOW()
        WHERE status = 'processing'
          AND "lockedAt" < NOW() - INTERVAL '${STUCK_JOB_TIMEOUT_MINUTES} minutes'
      `);

      // Fetch and lock the next batch of due messages
      const rows: { id: number }[] = await queryRunner.query(`
        SELECT id FROM scheduled_message
        WHERE status = 'pending' AND "sendAt" <= NOW()
        ORDER BY "sendAt" ASC
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      `);

      if (rows.length === 0) {
        await queryRunner.rollbackTransaction();
        this.logger.debug('No pending scheduled messages due');
        return;
      }

      idsToDispatch = rows.map((r) => r.id);

      await queryRunner.query(
        `
        UPDATE scheduled_message
        SET status = 'processing', "lockedAt" = NOW(), "lockedBy" = 'scheduler', "updatedAt" = NOW()
        WHERE id = ANY($1)
      `,
        [idsToDispatch],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to lock scheduled messages batch', error);
      return;
    } finally {
      await queryRunner.release();
    }

    // Publish to SQS outside the transaction — failures here are recoverable
    // via stuck job reset on the next poll
    let dispatched = 0;
    for (const id of idsToDispatch) {
      try {
        await this.queueService.sendMessage(AwsQueueNames.SCHEDULED_MESSAGES, {
          scheduledMessageId: id,
        });
        dispatched++;
      } catch (error) {
        this.logger.error(
          `Failed to publish scheduled message #${id} to SQS`,
          error,
        );
      }
    }

    this.logger.debug(
      `Dispatched ${dispatched}/${idsToDispatch.length} scheduled messages to SQS`,
    );
  }
}
