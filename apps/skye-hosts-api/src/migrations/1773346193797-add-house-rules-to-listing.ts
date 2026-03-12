import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHouseRulesToListing1773346193797 implements MigrationInterface {
  name = 'AddHouseRulesToListing1773346193797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRulePetsAllowed" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleEventsAllowed" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleSmokingAllowed" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleVapingAllowed" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleQuietHoursEnabled" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleQuietHoursStart" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleQuietHoursEnd" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "houseRuleOtherRules" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleOtherRules"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleQuietHoursEnd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleQuietHoursStart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleQuietHoursEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleVapingAllowed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleSmokingAllowed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRuleEventsAllowed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "houseRulePetsAllowed"`,
    );
  }
}
