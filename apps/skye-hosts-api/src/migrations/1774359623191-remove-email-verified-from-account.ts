import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmailVerifiedFromAccount1774359623191 implements MigrationInterface {
  name = 'RemoveEmailVerifiedFromAccount1774359623191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "emailVerified"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "emailVerified" boolean NOT NULL DEFAULT false`,
    );
  }
}
