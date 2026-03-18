import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingImage1773859190516 implements MigrationInterface {
  name = 'AddListingImage1773859190516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listingId" integer NOT NULL, "position" integer NOT NULL DEFAULT '0', "originalKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5884ca1c2018515c1d738fd18e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_image" ADD CONSTRAINT "FK_b0d09774d741ddf347b214b95e0" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing_image" DROP CONSTRAINT "FK_b0d09774d741ddf347b214b95e0"`,
    );
    await queryRunner.query(`DROP TABLE "listing_image"`);
  }
}
