import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNumberOfGuestsToBooking1774376281515 implements MigrationInterface {
  name = 'AddNumberOfGuestsToBooking1774376281515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking" ADD "numberOfGuests" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "searchEngineIndexingEnabled" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ALTER COLUMN "searchEngineIndexingEnabled" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP COLUMN "numberOfGuests"`,
    );
  }
}
