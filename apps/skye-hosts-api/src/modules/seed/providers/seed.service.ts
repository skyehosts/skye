import { Injectable, Logger } from '@nestjs/common';
import {
  MessageLog,
  SentMessage,
} from 'src/modules/scheduled-message/entities';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { DatabaseService } from '../../common/providers';
import { Demo } from '../../demo/entities';
import { Listing } from '../../listing/entities';
import { Message } from '../../message/entities';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private databaseService: DatabaseService) {}

  async createData() {
    await this.databaseService.getRepository(Demo).insert({
      foo: 'bar',
    });
  }

  async truncateData(): Promise<void> {
    const entities = [
      Message,
      MessageLog,
      SentMessage,
      Booking,
      Listing,
      Account,
      Demo,
    ];

    for (const entity of entities) {
      const repository = this.databaseService.getRepository(entity);
      const count = await repository.count();
      await repository.clear();
      this.logger.debug(`Cleared ${entity.name}: ${count} records deleted`);
    }
  }
}
