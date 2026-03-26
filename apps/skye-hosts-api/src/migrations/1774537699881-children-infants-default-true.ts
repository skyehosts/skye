import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChildrenInfantsDefaultTrue1774537699881 implements MigrationInterface {
  name = 'ChildrenInfantsDefaultTrue1774537699881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "listing" SET "houseRuleChildrenAllowed" = true WHERE "houseRuleChildrenAllowed" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "listing" SET "houseRuleInfantsAllowed" = true WHERE "houseRuleInfantsAllowed" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleChildrenAllowed" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleChildrenAllowed" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleInfantsAllowed" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleInfantsAllowed" SET DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleInfantsAllowed" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleInfantsAllowed" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleChildrenAllowed" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ALTER COLUMN "houseRuleChildrenAllowed" DROP NOT NULL`,
    );
  }
}
