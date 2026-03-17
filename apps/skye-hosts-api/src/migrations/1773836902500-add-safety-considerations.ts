import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSafetyConsiderations1773836902500 implements MigrationInterface {
  name = 'AddSafetyConsiderations1773836902500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "safetyConsiderations" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "safetyConsiderations"`,
    );
  }
}
