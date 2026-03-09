import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionFields1772910000000 implements MigrationInterface {
  name = 'AddDescriptionFields1772910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "descriptionLong" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "guestAccess" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "interactionWithGuests" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "otherDetailsToNote" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "otherDetailsToNote"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "interactionWithGuests"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "guestAccess"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "descriptionLong"`,
    );
  }
}
