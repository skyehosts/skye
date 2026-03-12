import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHouseManualToListing1773318806233 implements MigrationInterface {
  name = 'AddHouseManualToListing1773318806233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" ADD "houseManual" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "houseManual"`);
  }
}
