import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationPreference1772883008616 implements MigrationInterface {
  name = 'AddNotificationPreference1772883008616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_preference" ("id" SERIAL NOT NULL, "accountId" integer NOT NULL, "eventType" character varying NOT NULL, "pushEnabled" boolean NOT NULL DEFAULT true, "emailEnabled" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_36537c3546eeddb9d4526212754" UNIQUE ("accountId", "eventType"), CONSTRAINT "PK_ba8d816b10f3dcfcd2e71ce5776" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ADD CONSTRAINT "FK_56fcad962d36df7932eb11f3abe" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_preference" DROP CONSTRAINT "FK_56fcad962d36df7932eb11f3abe"`,
    );
    await queryRunner.query(`DROP TABLE "notification_preference"`);
  }
}
