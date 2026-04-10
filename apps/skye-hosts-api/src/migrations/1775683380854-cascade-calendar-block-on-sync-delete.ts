import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeCalendarBlockOnSyncDelete1775683380854 implements MigrationInterface {
  name = 'CascadeCalendarBlockOnSyncDelete1775683380854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_block" DROP CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_block" ADD CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea" FOREIGN KEY ("calendarSyncId") REFERENCES "calendar_sync"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_block" DROP CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_block" ADD CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea" FOREIGN KEY ("calendarSyncId") REFERENCES "calendar_sync"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
