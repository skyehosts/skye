import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChildrenInfantsHouseRules1774536650837 implements MigrationInterface {
  name = 'AddChildrenInfantsHouseRules1774536650837';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleChildrenAllowed" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleInfantsAllowed" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleInfantsAllowed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleChildrenAllowed"`,
    );
  }
}
