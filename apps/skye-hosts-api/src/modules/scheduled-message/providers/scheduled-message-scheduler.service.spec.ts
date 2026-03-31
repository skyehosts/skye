import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import * as Sentry from '@sentry/nestjs';
import { DataSource } from 'typeorm';
import { AwsQueueSendMessageService } from '../../queue/providers';
import { AwsQueueNames } from '../../queue/types';
import { ScheduledMessageSchedulerService } from './scheduled-message-scheduler.service';

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
}));

// ── Mock factories ─────────────────────────────────────────────────────────────

function makeQueryRunner() {
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ScheduledMessageSchedulerService', () => {
  let service: ScheduledMessageSchedulerService;
  let queryRunner: ReturnType<typeof makeQueryRunner>;
  let dataSource: { createQueryRunner: jest.Mock };
  let queueService: { sendMessage: jest.Mock };

  beforeEach(async () => {
    queryRunner = makeQueryRunner();
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };
    queueService = { sendMessage: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMessageSchedulerService,
        { provide: DataSource, useValue: dataSource },
        { provide: AwsQueueSendMessageService, useValue: queueService },
        {
          provide: SchedulerRegistry,
          useValue: { addCronJob: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ScheduledMessageSchedulerService);
    jest.clearAllMocks();

    // Re-wire after clearAllMocks
    queryRunner.connect.mockResolvedValue(undefined);
    queryRunner.startTransaction.mockResolvedValue(undefined);
    queryRunner.commitTransaction.mockResolvedValue(undefined);
    queryRunner.rollbackTransaction.mockResolvedValue(undefined);
    queryRunner.release.mockResolvedValue(undefined);
    dataSource.createQueryRunner.mockReturnValue(queryRunner);
    queueService.sendMessage.mockResolvedValue(undefined);
  });

  describe('pollAndDispatch', () => {
    it('should rollback and not dispatch to SQS when no messages are due', async () => {
      queryRunner.query
        .mockResolvedValueOnce(undefined) // stuck job reset
        .mockResolvedValueOnce([]); // SELECT → empty

      await service.pollAndDispatch();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queueService.sendMessage).not.toHaveBeenCalled();
    });

    it('should lock all due messages and dispatch each to SQS', async () => {
      queryRunner.query
        .mockResolvedValueOnce(undefined) // stuck job reset
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // SELECT
        .mockResolvedValueOnce(undefined); // UPDATE lock

      await service.pollAndDispatch();

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queueService.sendMessage).toHaveBeenCalledTimes(2);
      expect(queueService.sendMessage).toHaveBeenCalledWith(
        AwsQueueNames.SCHEDULED_MESSAGES,
        { scheduledMessageId: 1 },
      );
      expect(queueService.sendMessage).toHaveBeenCalledWith(
        AwsQueueNames.SCHEDULED_MESSAGES,
        { scheduledMessageId: 2 },
      );
    });

    it('should rollback, capture to Sentry, and not dispatch when the lock transaction fails', async () => {
      queryRunner.query
        .mockResolvedValueOnce(undefined) // stuck job reset
        .mockRejectedValueOnce(new Error('DB lock error')); // SELECT fails

      await service.pollAndDispatch();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
      expect(queueService.sendMessage).not.toHaveBeenCalled();
    });

    it('should continue dispatching remaining messages when SQS fails for one', async () => {
      queryRunner.query
        .mockResolvedValueOnce(undefined) // stuck job reset
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }]) // SELECT
        .mockResolvedValueOnce(undefined); // UPDATE lock

      queueService.sendMessage
        .mockResolvedValueOnce(undefined) // id 1 ok
        .mockRejectedValueOnce(new Error('SQS timeout')) // id 2 fails
        .mockResolvedValueOnce(undefined); // id 3 ok

      await service.pollAndDispatch();

      expect(queueService.sendMessage).toHaveBeenCalledTimes(3);
      expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    });

    it('should reset stuck processing jobs before fetching the next batch', async () => {
      queryRunner.query
        .mockResolvedValueOnce(undefined) // stuck job reset
        .mockResolvedValueOnce([]); // SELECT → empty (triggers early return)

      await service.pollAndDispatch();

      const [stuckResetSql] = queryRunner.query.mock.calls[0];
      expect(stuckResetSql).toContain("status = 'pending'");
      expect(stuckResetSql).toContain("status = 'processing'");
      expect(stuckResetSql).toContain('5 minutes');
      // Stuck reset runs BEFORE the SELECT
      const [selectSql] = queryRunner.query.mock.calls[1];
      expect(selectSql).toContain('SELECT id FROM scheduled_message');
    });
  });
});
