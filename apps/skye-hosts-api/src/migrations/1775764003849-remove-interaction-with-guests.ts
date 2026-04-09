import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveInteractionWithGuests1775764003849 implements MigrationInterface {
  name = 'RemoveInteractionWithGuests1775764003849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP COLUMN "interactionWithGuests"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "interactionWithGuests" character varying NOT NULL DEFAULT ''`,
    );
  }
}
