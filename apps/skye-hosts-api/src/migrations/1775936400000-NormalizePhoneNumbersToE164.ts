import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizePhoneNumbersToE1641775936400000 implements MigrationInterface {
  name = 'NormalizePhoneNumbersToE1641775936400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert 07... → +447...
    await queryRunner.query(
      `UPDATE "account" SET "phoneNumber" = '+44' || SUBSTRING("phoneNumber", 2) WHERE "phoneNumber" LIKE '0%'`,
    );

    // Convert bare digits (e.g. 7436058917) → +447436058917
    await queryRunner.query(
      `UPDATE "account" SET "phoneNumber" = '+44' || "phoneNumber" WHERE "phoneNumber" IS NOT NULL AND "phoneNumber" NOT LIKE '+%' AND "phoneNumber" NOT LIKE '0%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert +44... back to 0...
    await queryRunner.query(
      `UPDATE "account" SET "phoneNumber" = '0' || SUBSTRING("phoneNumber", 4) WHERE "phoneNumber" LIKE '+44%'`,
    );
  }
}
