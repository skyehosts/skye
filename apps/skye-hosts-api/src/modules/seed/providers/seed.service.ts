import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  MessageLog,
  SentMessage,
} from 'src/modules/scheduled-message/entities';
import { DataSource } from 'typeorm';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { Demo } from '../../demo/entities';
import { Listing } from '../../listing/entities';
import { Message } from '../../message/entities';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createData() {
    await this.dataSource.getRepository(Demo).insert({
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
      const repository = this.dataSource.getRepository(entity);
      const count = await repository.count();
      await repository.clear();
      this.logger.debug(`Cleared ${entity.name}: ${count} records deleted`);
    }
  }
}
