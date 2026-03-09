import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1772817614113 implements MigrationInterface {
  name = 'Initial1772817614113';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account" ("cookieUsageEnabled" boolean, "dateJoined" TIMESTAMP NOT NULL, "email" character varying, "id" SERIAL NOT NULL, "lastLoggedIn" TIMESTAMP NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying, "role" character varying NOT NULL DEFAULT 'guest', "passwordResetToken" character varying, "passwordResetTokenExpiry" TIMESTAMP, "phoneNumber" character varying, "refreshTokenHash" character varying, "refreshTokenExpiry" TIMESTAMP, "stripeCustomerId" character varying, "subscribedToNewsViaEmail" boolean NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listing" ("id" SERIAL NOT NULL, "hostId" integer NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "typeId" character varying NOT NULL, "spaceType" character varying NOT NULL, "maxGuests" integer NOT NULL, "bedrooms" integer NOT NULL, "beds" integer NOT NULL, "bathrooms" integer NOT NULL, "postCode" character varying NOT NULL, "amenities" text NOT NULL, "highlights" text NOT NULL, "bookingType" character varying NOT NULL, "safetyDisclosures" text NOT NULL, "timezone" character varying NOT NULL DEFAULT 'Europe/London', "status" character varying NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_381d45ebb8692362c156d6b87d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "guestId" integer NOT NULL, "checkInAt" TIMESTAMP WITH TIME ZONE NOT NULL, "checkOutAt" TIMESTAMP WITH TIME ZONE NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "demo" ("id" SERIAL NOT NULL, "foo" character varying NOT NULL, CONSTRAINT "PK_9d8d89f7764de19ec5a40a5f056" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" SERIAL NOT NULL, "bookingId" integer NOT NULL, "senderId" integer NOT NULL, "content" text NOT NULL, "readAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "message_template" ("id" SERIAL NOT NULL, "hostId" integer NOT NULL, "name" character varying NOT NULL, "channel" character varying NOT NULL DEFAULT 'in_app', "isActive" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_616800da109c721fb4dd2019a9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listing_message_template" ("id" SERIAL NOT NULL, "listingId" integer NOT NULL, "messageTemplateId" integer NOT NULL, "attachedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_43141cdbbb3a3c3f7a4521ad5d6" UNIQUE ("listingId", "messageTemplateId"), CONSTRAINT "PK_2d4d7dc9850ec51b27c3089cd9b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "template_trigger" ("id" SERIAL NOT NULL, "messageTemplateId" integer NOT NULL, "triggerType" character varying NOT NULL, "offsetValue" integer NOT NULL, "offsetUnit" character varying NOT NULL, "allowMultiplePerBooking" boolean NOT NULL DEFAULT false, "sendIfPast" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_f3da6360c6469497dc570a7118f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "template_version" ("id" SERIAL NOT NULL, "messageTemplateId" integer NOT NULL, "versionNumber" integer NOT NULL, "content" text NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5c57453edc10a775036dd2f2124" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scheduled_message" ("id" SERIAL NOT NULL, "bookingId" integer NOT NULL, "listingId" integer NOT NULL, "templateVersionId" integer NOT NULL, "templateTriggerId" integer NOT NULL, "sendAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "idempotencyKey" character varying NOT NULL, "retryCount" integer NOT NULL DEFAULT '0', "lockedAt" TIMESTAMP WITH TIME ZONE, "lockedBy" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_8d472c8abb6cb8ad2f2414fb7e6" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_2e6addf57f9f8551a3b4187f6b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b09b355b0298685172310886c6" ON "scheduled_message" ("status", "sendAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "message_log" ("id" SERIAL NOT NULL, "scheduledMessageId" integer NOT NULL, "action" character varying NOT NULL, "details" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_f89fb3fddab953711137ce8b62c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sent_message" ("id" SERIAL NOT NULL, "scheduledMessageId" integer NOT NULL, "renderedContent" text NOT NULL, "deliveryMetadata" jsonb, "sentAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_37efcdbf204194da12b5b6b03ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_c3df1780eccf7f9db2c7d2000cb" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_3f5a7e4b2d53255376e4506ae68" FOREIGN KEY ("guestId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_6a3b9051bc3863c38d2f8d06df4" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_template" ADD CONSTRAINT "FK_bb81bc0a332f6c297e04837fd87" FOREIGN KEY ("hostId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_message_template" ADD CONSTRAINT "FK_46b73d410e292529913e03e5e2e" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_message_template" ADD CONSTRAINT "FK_171853fc11cdf77f335693866c0" FOREIGN KEY ("messageTemplateId") REFERENCES "message_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "template_trigger" ADD CONSTRAINT "FK_7df27065c704ae7b8bf14a5f080" FOREIGN KEY ("messageTemplateId") REFERENCES "message_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "template_version" ADD CONSTRAINT "FK_fc9fb1f48d5b71dbcddfeac13b5" FOREIGN KEY ("messageTemplateId") REFERENCES "message_template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" ADD CONSTRAINT "FK_620747bc55acded89a944e6e1e1" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" ADD CONSTRAINT "FK_6e1a89a7da95d51bf641676547a" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" ADD CONSTRAINT "FK_847941714e943f57fdad63ae6a6" FOREIGN KEY ("templateVersionId") REFERENCES "template_version"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" ADD CONSTRAINT "FK_0a3564ce2980f232cc8cc6156b5" FOREIGN KEY ("templateTriggerId") REFERENCES "template_trigger"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_log" ADD CONSTRAINT "FK_dda8b2161089b897bdad6ba53c7" FOREIGN KEY ("scheduledMessageId") REFERENCES "scheduled_message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sent_message" ADD CONSTRAINT "FK_3ecb1dbbffee65157c81c497c81" FOREIGN KEY ("scheduledMessageId") REFERENCES "scheduled_message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sent_message" DROP CONSTRAINT "FK_3ecb1dbbffee65157c81c497c81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_log" DROP CONSTRAINT "FK_dda8b2161089b897bdad6ba53c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" DROP CONSTRAINT "FK_0a3564ce2980f232cc8cc6156b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" DROP CONSTRAINT "FK_847941714e943f57fdad63ae6a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" DROP CONSTRAINT "FK_6e1a89a7da95d51bf641676547a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_message" DROP CONSTRAINT "FK_620747bc55acded89a944e6e1e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "template_version" DROP CONSTRAINT "FK_fc9fb1f48d5b71dbcddfeac13b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "template_trigger" DROP CONSTRAINT "FK_7df27065c704ae7b8bf14a5f080"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_message_template" DROP CONSTRAINT "FK_171853fc11cdf77f335693866c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing_message_template" DROP CONSTRAINT "FK_46b73d410e292529913e03e5e2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message_template" DROP CONSTRAINT "FK_bb81bc0a332f6c297e04837fd87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_6a3b9051bc3863c38d2f8d06df4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_3f5a7e4b2d53255376e4506ae68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_c3df1780eccf7f9db2c7d2000cb"`,
    );
    await queryRunner.query(`DROP TABLE "sent_message"`);
    await queryRunner.query(`DROP TABLE "message_log"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b09b355b0298685172310886c6"`,
    );
    await queryRunner.query(`DROP TABLE "scheduled_message"`);
    await queryRunner.query(`DROP TABLE "template_version"`);
    await queryRunner.query(`DROP TABLE "template_trigger"`);
    await queryRunner.query(`DROP TABLE "listing_message_template"`);
    await queryRunner.query(`DROP TABLE "message_template"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TABLE "demo"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TABLE "listing"`);
    await queryRunner.query(`DROP TABLE "account"`);
  }
}
