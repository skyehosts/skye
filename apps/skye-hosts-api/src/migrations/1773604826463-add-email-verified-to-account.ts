import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerifiedToAccount1773604826463 implements MigrationInterface {
  name = 'AddEmailVerifiedToAccount1773604826463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "emailVerified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "emailVerified"`,
    );
  }
}
