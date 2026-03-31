import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLabelToCalendarSync1774978615372 implements MigrationInterface {
  name = 'AddLabelToCalendarSync1774978615372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_sync" ADD "label" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "calendar_sync" DROP COLUMN "label"`);
  }
}
