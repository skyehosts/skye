import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessibilityFeatures1773750502500 implements MigrationInterface {
  name = 'AddAccessibilityFeatures1773750502500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "accessibilityFeatures" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "accessibilityFeatures"`,
    );
  }
}
