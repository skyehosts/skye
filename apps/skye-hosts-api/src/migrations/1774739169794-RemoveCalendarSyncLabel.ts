import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCalendarSyncLabel1774739169794 implements MigrationInterface {
  name = 'RemoveCalendarSyncLabel1774739169794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "calendar_sync" DROP COLUMN "label"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ADD "label" character varying NOT NULL`,
    );
  }
}
