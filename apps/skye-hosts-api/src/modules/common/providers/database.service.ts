import { Injectable } from '@nestjs/common';
import { Connection, EntityManager, EntityTarget, Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly connection: Connection,
    private entityManager: EntityManager,
  ) {}

  getRepository<Type>(type: EntityTarget<Type>): Repository<Type> {
    return this.entityManager.getRepository(type);
  }

  async runInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
