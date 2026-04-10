import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCalendarSyncEnabledFlags1775231441516 implements MigrationInterface {
  name = 'RemoveCalendarSyncEnabledFlags1775231441516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" DROP COLUMN "isImportEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" DROP COLUMN "isExportEnabled"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ADD "isExportEnabled" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ADD "isImportEnabled" boolean NOT NULL DEFAULT true`,
    );
  }
}
