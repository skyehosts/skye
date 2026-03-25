import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchEngineIndexingEnabled1774365085527 implements MigrationInterface {
  name = 'AddSearchEngineIndexingEnabled1774365085527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "searchEngineIndexingEnabled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "searchEngineIndexingEnabled"`,
    );
  }
}
