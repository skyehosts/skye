import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPinToAccount1772890000000 implements MigrationInterface {
  name = 'AddPinToAccount1772890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "pinHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "pinSalt" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "pinSalt"`);
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "pinHash"`);
  }
}
