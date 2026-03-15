import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoHostTables1773435776933 implements MigrationInterface {
  name = 'AddCoHostTables1773435776933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "co_host_invite" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "inviterAccountId" integer NOT NULL, "inviteeEmail" character varying NOT NULL, "role" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a64947498e3aac47dccaed939a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listing_user_role" ("id" SERIAL NOT NULL, "accountId" integer NOT NULL, "listingId" integer NOT NULL, "role" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_82562e0c00847d9a04f84352e5c" UNIQUE ("accountId", "listingId"), CONSTRAINT "PK_1af5d546e642bd39eef032e2ded" PRIMARY KEY ("id"))`,
    );
    const col = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name='listing' AND column_name='houseRuleMaxGuests'`,
    );
    if (col.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "listing" DROP COLUMN "houseRuleMaxGuests"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleMaxGuests" integer`,
    );
    await queryRunner.query(`DROP TABLE "listing_user_role"`);
    await queryRunner.query(`DROP TABLE "co_host_invite"`);
  }
}
