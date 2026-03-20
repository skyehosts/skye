import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShortTermLetLicenseConfirmed1774019337979 implements MigrationInterface {
  name = 'AddShortTermLetLicenseConfirmed1774019337979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "shortTermLetLicenseConfirmed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "shortTermLetLicenseConfirmed"`,
    );
  }
}
