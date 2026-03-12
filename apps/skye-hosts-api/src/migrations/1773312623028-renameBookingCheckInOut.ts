import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameBookingCheckInOut1773312623028 implements MigrationInterface {
  name = 'RenameBookingCheckInOut1773312623028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "checkInAt"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "checkOutAt"`);
    await queryRunner.query(
      `ALTER TABLE "booking" ADD "checkInDate" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD "checkOutDate" date NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "checkOutDate"`);
    await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "checkInDate"`);
    await queryRunner.query(
      `ALTER TABLE "booking" ADD "checkOutAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD "checkInAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }
}
