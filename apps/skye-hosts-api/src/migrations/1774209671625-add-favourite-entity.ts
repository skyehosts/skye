import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFavouriteEntity1774209671625 implements MigrationInterface {
  name = 'AddFavouriteEntity1774209671625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "favourite" ("id" SERIAL NOT NULL, "accountId" integer NOT NULL, "listingId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a9134bd2874864d96734945fe7" UNIQUE ("accountId", "listingId"), CONSTRAINT "PK_56f1996fc2983d1895e4a8f3af3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite" ADD CONSTRAINT "FK_e6f04d58b8ee984c9c0c8690d24" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite" ADD CONSTRAINT "FK_5bf43abeda11c9e7fcb84c31b8b" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favourite" DROP CONSTRAINT "FK_5bf43abeda11c9e7fcb84c31b8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourite" DROP CONSTRAINT "FK_e6f04d58b8ee984c9c0c8690d24"`,
    );
    await queryRunner.query(`DROP TABLE "favourite"`);
  }
}
