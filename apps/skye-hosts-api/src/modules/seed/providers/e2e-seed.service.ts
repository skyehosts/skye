import { Injectable, Logger } from '@nestjs/common';
import {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSpaceType,
  ListingTypeId,
} from '@repo/skye-hosts-api-client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { Demo } from '../../demo/entities';
import { Listing } from '../../listing/entities';
import { Message } from '../../message/entities';
import {
  ListingMessageTemplate,
  MessageLog,
  MessageTemplate,
  ScheduledMessage,
  SentMessage,
  TemplateTrigger,
  TemplateVersion,
} from '../../scheduled-message/entities';

@Injectable()
export class E2eSeedService {
  private readonly logger = new Logger(E2eSeedService.name);

  constructor(private dataSource: DataSource) {}

  async resetAndSeed(): Promise<void> {
    await this.truncateAll();
    await this.seed();
    this.logger.debug('E2E database reset and seeded successfully');
  }

  private async truncateAll(): Promise<void> {
    const entities = [
      MessageLog,
      SentMessage,
      ScheduledMessage,
      ListingMessageTemplate,
      TemplateVersion,
      TemplateTrigger,
      MessageTemplate,
      Message,
      Booking,
      Listing,
      Account,
      Demo,
    ];

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity);
      await repository.query(
        `TRUNCATE TABLE "${repository.metadata.tableName}" CASCADE`,
      );
      this.logger.debug(`Truncated ${entity.name}`);
    }
  }

  private async seed(): Promise<void> {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const accountRepo = this.dataSource.getRepository(Account);

    // Generate a known PIN hash for the host account (PIN: 1234)
    const pinSalt = randomBytes(16).toString('hex');
    const pinHash = createHash('sha256')
      .update(pinSalt + '1234')
      .digest('hex');

    const host = await accountRepo.save(
      accountRepo.create({
        name: 'Test Host',
        email: 'host@test.com',
        phoneNumber: '+447700900001',
        passwordHash,
        pinHash,
        pinSalt,
        role: 'host',
        dateJoined: now,
        lastLoggedIn: now,
        cookieUsageEnabled: true,
        subscribedToNewsViaEmail: false,
      }),
    );

    const guest = await accountRepo.save(
      accountRepo.create({
        name: 'Test Guest',
        email: 'guest@test.com',
        phoneNumber: '+447700900002',
        passwordHash,
        role: 'guest',
        dateJoined: now,
        lastLoggedIn: now,
        cookieUsageEnabled: true,
        subscribedToNewsViaEmail: false,
      }),
    );

    const listingRepo = this.dataSource.getRepository(Listing);

    const listingResult = await listingRepo.insert({
      hostId: host.id,
      title: 'E2E Test Glamping Pod',
      description:
        'A beautiful glamping pod for e2e testing with stunning views.',
      typeId: ListingTypeId.Cabin,
      spaceType: ListingSpaceType.EntirePlace,
      maxGuests: 4,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      postCode: 'BT1 1AA',
      amenities: [ListingAmenityId.Wifi, ListingAmenityId.FreeParking],
      highlights: [ListingHighlightId.Peaceful],
      bookingType: ListingBookingType.InstantBook,
      safetyDisclosures: [],
      timezone: 'Europe/London',
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    });
    const listingId = listingResult.identifiers[0].id as number;

    const bookingRepo = this.dataSource.getRepository(Booking);

    await bookingRepo.insert({
      listingId,
      guestId: guest.id,
      checkInDate: '2026-04-01',
      checkOutDate: '2026-04-03',
      totalPrice: 250.0,
      status: 'confirmed',
      createdAt: now,
    });

    this.logger.debug(`Seeded: 2 accounts, 1 listing, 1 booking`);
  }
}
