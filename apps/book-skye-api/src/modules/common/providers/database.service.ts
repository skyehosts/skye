import { Injectable } from '@nestjs/common';
import {
  Connection,
  EntityManager,
  EntityTarget,
  QueryRunner,
  Repository,
} from 'typeorm';

@Injectable()
export class DatabaseService {
  private currentTransactionQueryRunner: QueryRunner;

  constructor(
    private readonly connection: Connection,
    private entityManager: EntityManager,
  ) {}

  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.currentTransactionQueryRunner = queryRunner;
    return queryRunner;
  }

  async releaseTransaction(): Promise<void> {
    await this.currentTransactionQueryRunner.release();
  }

  private getManager(): EntityManager {
    if (
      this.currentTransactionQueryRunner &&
      !this.currentTransactionQueryRunner.isReleased
    ) {
      return this.currentTransactionQueryRunner.manager;
    }
    return this.entityManager;
  }

  getRepository<Type>(type: EntityTarget<Type>): Repository<Type> {
    return this.getManager().getRepository(type);
  }
}
