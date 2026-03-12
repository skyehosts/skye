import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHostInteractionToListing1773327655961 implements MigrationInterface {
  name = 'AddHostInteractionToListing1773327655961';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "hostInteraction" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "hostInteraction"`,
    );
  }
}
