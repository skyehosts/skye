import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinMaxNightsToListing1774620000334 implements MigrationInterface {
  name = 'AddMinMaxNightsToListing1774620000334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "minNights" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "minNightsByCheckInDay" json`,
    );
    await queryRunner.query(`ALTER TABLE "listing" ADD "maxNights" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "maxNights"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "minNightsByCheckInDay"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "minNights"`);
  }
}
