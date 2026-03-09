import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceTokenAndNotificationHistory1772883100000 implements MigrationInterface {
  name = 'AddDeviceTokenAndNotificationHistory1772883100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "device_token" (
        "id" SERIAL NOT NULL,
        "accountId" integer NOT NULL,
        "token" character varying NOT NULL,
        "platform" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_device_token_token" UNIQUE ("token"),
        CONSTRAINT "PK_device_token_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_token" ADD CONSTRAINT "FK_device_token_account" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "notification_history" (
        "id" SERIAL NOT NULL,
        "accountId" integer NOT NULL,
        "eventType" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "status" character varying NOT NULL,
        "expoTicketId" character varying,
        "expoResponse" jsonb,
        "errorMessage" character varying,
        "attemptCount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_history_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_history" ADD CONSTRAINT "FK_notification_history_account" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_device_token_accountId" ON "device_token" ("accountId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_history_accountId" ON "notification_history" ("accountId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notification_history_accountId"`);
    await queryRunner.query(`DROP INDEX "IDX_device_token_accountId"`);
    await queryRunner.query(
      `ALTER TABLE "notification_history" DROP CONSTRAINT "FK_notification_history_account"`,
    );
    await queryRunner.query(`DROP TABLE "notification_history"`);
    await queryRunner.query(
      `ALTER TABLE "device_token" DROP CONSTRAINT "FK_device_token_account"`,
    );
    await queryRunner.query(`DROP TABLE "device_token"`);
  }
}
