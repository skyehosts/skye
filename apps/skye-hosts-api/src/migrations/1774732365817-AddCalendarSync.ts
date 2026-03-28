import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalendarSync1774732365817 implements MigrationInterface {
  name = 'AddCalendarSync1774732365817';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "calendar_sync" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "platform" character varying NOT NULL, "label" character varying NOT NULL, "importUrl" text, "exportToken" character varying NOT NULL, "lastImportAt" TIMESTAMP WITH TIME ZONE, "lastImportStatus" character varying, "lastImportError" text, "lastImportEventCount" integer, "consecutiveFailures" integer NOT NULL DEFAULT '0', "isImportEnabled" boolean NOT NULL DEFAULT true, "isExportEnabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6652ce5273b0d77c9e8bd5a6037" UNIQUE ("exportToken"), CONSTRAINT "PK_eb7d9a4c7fb12454b921c523bd5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_12d1ddede3812fc8a5a39606df" ON "calendar_sync" ("listingId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_block" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "calendarSyncId" integer, "source" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "summary" character varying, "externalUid" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5d689c0874a6661dd99141b2dd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1aefbc501467708ac79bbd0c9f" ON "calendar_block" ("calendarSyncId", "externalUid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a27643d8f9c70a642e867ad1b3" ON "calendar_block" ("listingId", "startDate", "endDate") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_block" ADD CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea" FOREIGN KEY ("calendarSyncId") REFERENCES "calendar_sync"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_block" DROP CONSTRAINT "FK_cc7aae7e416fc1ae75825deb3ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a27643d8f9c70a642e867ad1b3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1aefbc501467708ac79bbd0c9f"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_block"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_12d1ddede3812fc8a5a39606df"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_sync"`);
  }
}
