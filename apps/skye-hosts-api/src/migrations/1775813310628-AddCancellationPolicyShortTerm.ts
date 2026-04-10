import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCancellationPolicyShortTerm1775813310628 implements MigrationInterface {
  name = 'AddCancellationPolicyShortTerm1775813310628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "cancellationPolicyShortTerm" character varying NOT NULL DEFAULT '5_days'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "cancellationPolicyShortTerm"`,
    );
  }
}
