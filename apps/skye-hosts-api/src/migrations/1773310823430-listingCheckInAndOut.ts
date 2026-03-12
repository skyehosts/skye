import { MigrationInterface, QueryRunner } from 'typeorm';

export class ListingCheckInAndOut1773310823430 implements MigrationInterface {
  name = 'ListingCheckInAndOut1773310823430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "device_token" DROP CONSTRAINT "FK_device_token_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_history" DROP CONSTRAINT "FK_notification_history_account"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_device_token_accountId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_notification_history_accountId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkInTimeStart" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkInTimeEnd" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkOutTime" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_token" ADD CONSTRAINT "FK_cc14de3cb188122063132fdbd80" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_history" ADD CONSTRAINT "FK_6879ac4de4f2e146abf711c5427" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_history" DROP CONSTRAINT "FK_6879ac4de4f2e146abf711c5427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_token" DROP CONSTRAINT "FK_cc14de3cb188122063132fdbd80"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "checkOutTime"`);
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkInTimeEnd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkInTimeStart"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_history_accountId" ON "notification_history" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_device_token_accountId" ON "device_token" ("accountId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_history" ADD CONSTRAINT "FK_notification_history_account" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_token" ADD CONSTRAINT "FK_device_token_account" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
