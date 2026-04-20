import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingPricing1776700500150 implements MigrationInterface {
  name = 'AddListingPricing1776700500150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing_season_pricing" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "season" character varying NOT NULL, "weekdayPricePence" integer NOT NULL, "weekendPricePence" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_310ca8bc9b3565c9cb110efc002" UNIQUE ("listingId", "season"), CONSTRAINT "PK_6e48634f2d4d4977f3ec1d8d6d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae88aa6f1283486e288f408b2c" ON "listing_season_pricing" ("listingId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "listing_pricing" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "cleaningFeePence" integer NOT NULL DEFAULT '100', "extraGuestThreshold" integer NOT NULL DEFAULT '0', "extraGuestFeePence" integer NOT NULL DEFAULT '0', "lastMinuteEnabled" boolean NOT NULL DEFAULT false, "lastMinutePercent" integer NOT NULL DEFAULT '5', "weeklyEnabled" boolean NOT NULL DEFAULT false, "weeklyPercent" integer NOT NULL DEFAULT '10', "monthlyEnabled" boolean NOT NULL DEFAULT false, "monthlyPercent" integer NOT NULL DEFAULT '20', "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_40c4224240f6ac13a8f97124f6d" UNIQUE ("listingId"), CONSTRAINT "REL_40c4224240f6ac13a8f97124f6" UNIQUE ("listingId"), CONSTRAINT "PK_3996435fdd97ee2e8bb13dbc2f9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listing_price_override" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "date" date NOT NULL, "pricePence" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_ee7d3bcb4b551cf1daa49cda272" UNIQUE ("listingId", "date"), CONSTRAINT "PK_8c8feb25d8bc53ab450afb80759" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f0603e06e312e5ef54acbe688" ON "listing_price_override" ("listingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_89d06888ab448192f544a3db8d" ON "listing_price_override" ("date") `,
    );
    await queryRunner.query(`ALTER TABLE "booking" ADD "priceBreakdown" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "listing_season_pricing" ADD CONSTRAINT "FK_ae88aa6f1283486e288f408b2cf" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" ADD CONSTRAINT "FK_40c4224240f6ac13a8f97124f6d" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_price_override" ADD CONSTRAINT "FK_8f0603e06e312e5ef54acbe688c" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_price_override" DROP CONSTRAINT "FK_8f0603e06e312e5ef54acbe688c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_pricing" DROP CONSTRAINT "FK_40c4224240f6ac13a8f97124f6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_season_pricing" DROP CONSTRAINT "FK_ae88aa6f1283486e288f408b2cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP COLUMN "priceBreakdown"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_89d06888ab448192f544a3db8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f0603e06e312e5ef54acbe688"`,
    );
    await queryRunner.query(`DROP TABLE "listing_price_override"`);
    await queryRunner.query(`DROP TABLE "listing_pricing"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae88aa6f1283486e288f408b2c"`,
    );
    await queryRunner.query(`DROP TABLE "listing_season_pricing"`);
  }
}
