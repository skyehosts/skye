import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleaningFeeToPound1776870333257 implements MigrationInterface {
  name = 'CleaningFeeToPound1776870333257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" RENAME COLUMN "cleaningFeePence" TO "cleaningFeePound"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" ALTER COLUMN "cleaningFeePound" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" ALTER COLUMN "cleaningFeePound" SET DEFAULT '100'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" RENAME COLUMN "cleaningFeePound" TO "cleaningFeePence"`,
    );
  }
}
