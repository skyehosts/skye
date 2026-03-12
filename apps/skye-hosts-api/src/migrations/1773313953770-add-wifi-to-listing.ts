import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWifiToListing1773313953770 implements MigrationInterface {
  name = 'AddWifiToListing1773313953770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" ADD "directions" text`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "wifiNetwork" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "wifiPassword" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "wifiPassword"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "wifiNetwork"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "directions"`);
  }
}
