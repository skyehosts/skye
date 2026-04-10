import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarSyncExportTrackingAndRequiredImport1775240000000 implements MigrationInterface {
  name = 'CalendarSyncExportTrackingAndRequiredImport1775240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop any existing rows that have no import URL — importUrl is now required
    // for every sync (one-way export-only flow has been removed).
    await queryRunner.query(
      `DELETE FROM "calendar_sync" WHERE "importUrl" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ALTER COLUMN "importUrl" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ADD "lastExportedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" DROP COLUMN "lastExportedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ALTER COLUMN "importUrl" DROP NOT NULL`,
    );
  }
}
