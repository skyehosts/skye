import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropertyDetails1772900000000 implements MigrationInterface {
  name = 'AddPropertyDetails1772900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "totalFloors" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "listingFloor" integer NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "yearBuilt" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertySize" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "propertySizeUnit" character varying NOT NULL DEFAULT 'square_metres'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "propertySizeUnit"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "propertySize"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "yearBuilt"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "listingFloor"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "totalFloors"`);
  }
}
