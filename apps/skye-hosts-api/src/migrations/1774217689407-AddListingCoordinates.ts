import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingCoordinates1774217689407 implements MigrationInterface {
  name = 'AddListingCoordinates1774217689407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "latitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "longitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "approximateLatitude" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "approximateLongitude" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "approximateLongitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "approximateLatitude"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "latitude"`);
  }
}
