import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePhotoKeyToAccount1774459907329 implements MigrationInterface {
  name = 'AddProfilePhotoKeyToAccount1774459907329';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "profilePhotoKey" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" DROP COLUMN "profilePhotoKey"`,
    );
  }
}
