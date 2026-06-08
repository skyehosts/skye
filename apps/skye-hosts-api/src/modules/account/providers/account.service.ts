import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { UserRole } from '@repo/skye-hosts-api-client';
import * as Sentry from '@sentry/nestjs';
import { randomUUID } from 'crypto';
import { DeleteResult, Repository } from 'typeorm';
import { ConfigService } from '../../config/providers/config.service';
import { StripeService } from '../../stripe/providers';
import { Account } from '../entities';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnDomain: string;

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    const env = this.configService.getAll();
    this.bucketName = env.awsS3ImagesBucket;
    this.cdnDomain = env.awsCloudfrontImagesDomain;
  }

  async create(
    email: string,
    name: string,
    passwordHash: string,
    role: UserRole,
    subscribedToNewsViaEmail: boolean,
  ): Promise<Account> {
    // Deliberately creating customer before saving account so that worst case
    // we have an unassociated customer rather than an account without a customer.
    const stripeCustomer = await this.stripeService.createCustomer();
    const timestamp = new Date();

    return this.accountRepo.save({
      dateJoined: timestamp,
      email: email,
      lastLoggedIn: timestamp,
      name: name,
      passwordHash: passwordHash,
      role: role,
      stripeCustomerId: stripeCustomer.id,
      subscribedToNewsViaEmail: subscribedToNewsViaEmail,
    } as Account);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.accountRepo.delete(id);
  }

  async findById(id: number) {
    return this.accountRepo.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string) {
    return this.accountRepo.findOne({
      where: {
        email,
      },
    });
  }

  async createFromPhone(
    phoneNumber: string,
    name: string,
    email?: string,
  ): Promise<Account> {
    const timestamp = new Date();

    return this.accountRepo.save({
      dateJoined: timestamp,
      lastLoggedIn: timestamp,
      name: name,
      phoneNumber: phoneNumber,
      role: 'host',
      subscribedToNewsViaEmail: false,
      ...(email ? { email } : {}),
    } as Account);
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.accountRepo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.accountRepo.findOne({
      where: {
        passwordResetToken: token,
      },
    });
  }

  async save(account: Account) {
    return this.accountRepo.save(account);
  }

  async requestProfilePhotoUpload(
    accountId: number,
  ): Promise<{ uploadUrl: string; photoKey: string }> {
    const uuid = randomUUID();
    const photoKey = `accounts/${accountId}/profile-photo/${uuid}.jpeg`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: photoKey,
      ContentType: 'image/jpeg',
    });
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300,
    });
    return { uploadUrl, photoKey };
  }

  async confirmProfilePhotoUpload(
    accountId: number,
    photoKey: string,
  ): Promise<void> {
    if (!photoKey.startsWith(`accounts/${accountId}/`)) {
      throw new BadRequestException('Invalid photo key');
    }
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (account.profilePhotoKey) {
      await this.deleteS3Object(account.profilePhotoKey);
    }
    account.profilePhotoKey = photoKey;
    await this.accountRepo.save(account);
  }

  async deleteProfilePhoto(accountId: number): Promise<void> {
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
    });
    if (account?.profilePhotoKey) {
      await this.deleteS3Object(account.profilePhotoKey);
      account.profilePhotoKey = null;
      await this.accountRepo.save(account);
    }
  }

  buildProfilePhotoUrl(key: string | null): string | null {
    return `https://${this.cdnDomain}/${key}`;
  }

  private async deleteS3Object(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete S3 object ${key}: ${message}`);
      Sentry.captureException(error);
    }
  }
}
