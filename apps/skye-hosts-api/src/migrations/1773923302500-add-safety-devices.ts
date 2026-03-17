import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSafetyDevices1773923302500 implements MigrationInterface {
  name = 'AddSafetyDevices1773923302500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "safetyDevices" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "safetyDevices"`,
    );
  }
}
