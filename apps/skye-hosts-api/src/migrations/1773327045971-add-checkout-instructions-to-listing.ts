import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckoutInstructionsToListing1773327045971 implements MigrationInterface {
  name = 'AddCheckoutInstructionsToListing1773327045971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionTowels" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionRubbish" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionTurnThingsOff" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionLockUp" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionReturnKeys" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "checkoutInstructionAdditions" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionAdditions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionReturnKeys"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionLockUp"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionTurnThingsOff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionRubbish"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "checkoutInstructionTowels"`,
    );
  }
}
