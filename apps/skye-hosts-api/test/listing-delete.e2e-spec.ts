import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ListingAmenityId,
  ListingBookingType,
  ListingHighlightId,
  ListingSpaceType,
  ListingTypeId,
} from '@repo/skye-hosts-api-client';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { mainConfig } from '../src/main.config';
import { AppModule } from '../src/modules/app/app.module';
import { Booking } from '../src/modules/booking/entities';
import {
  CalendarBlock,
  CalendarSync,
} from '../src/modules/calendar-sync/entities';
import { Listing } from '../src/modules/listing/entities';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Listing Delete (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let hostToken: string;
  let guestToken: string;
  let listingWithBookingsId: number;
  let listingToDeleteId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    await app.init();

    dataSource = app.get(DataSource);

    const seedService = app.get(E2eSeedService);
    await seedService.resetAndSeed();

    const hostLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'host@test.com', password: 'Password123!' });
    hostToken = hostLogin.body.payload.accessToken;

    const guestLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'guest@test.com', password: 'Password123!' });
    guestToken = guestLogin.body.payload.accessToken;

    // Resolve the seeded listing (has future bookings)
    const listingsRes = await request(app.getHttpServer())
      .get('/listing')
      .set('Authorization', `Bearer ${hostToken}`);
    listingWithBookingsId = listingsRes.body.payload.listings[0].id;

    // Create a second listing with no bookings — this one can be deleted
    const hostId = (
      await dataSource
        .getRepository(Listing)
        .findOne({ where: { id: listingWithBookingsId } })
    ).hostId;

    const now = new Date();
    const result = await dataSource.getRepository(Listing).insert({
      hostId,
      title: 'Listing To Delete',
      description: 'This listing will be deleted in e2e tests.',
      typeId: ListingTypeId.Cabin,
      spaceType: ListingSpaceType.EntirePlace,
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      postCode: 'BT2 2BB',
      amenities: [ListingAmenityId.Wifi],
      highlights: [ListingHighlightId.Peaceful],
      bookingType: ListingBookingType.InstantBook,
      safetyDisclosures: [],
      timezone: 'Europe/London',
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    });
    listingToDeleteId = result.identifiers[0].id as number;

    // Add related data so we can verify cascade cleanup
    await dataSource.getRepository(CalendarSync).insert({
      listingId: listingToDeleteId,
      platform: 'airbnb',
      importUrl: 'https://example.com/airbnb-delete.ics',
      exportToken: 'test-export-token-delete',
    });

    await dataSource.getRepository(CalendarBlock).insert({
      listingId: listingToDeleteId,
      source: 'manual',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
    });

    // Add a past booking (should not block deletion)
    await dataSource.getRepository(Booking).insert({
      listingId: listingToDeleteId,
      guestId: hostId, // doesn't matter for this test
      checkInDate: '2025-01-01',
      checkOutDate: '2025-01-03',
      totalPrice: 100,
      status: 'confirmed',
      createdAt: now,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DELETE /listing/:id', () => {
    it('should return 403 for a guest', async () => {
      await request(app.getHttpServer())
        .delete(`/listing/${listingToDeleteId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });

    it('should return 401 without an auth token', async () => {
      await request(app.getHttpServer())
        .delete(`/listing/${listingToDeleteId}`)
        .expect(401);
    });

    it('should return 404 for a non-existent listing', async () => {
      await request(app.getHttpServer())
        .delete('/listing/999999')
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(404);
    });

    it('should return 400 when listing has future confirmed bookings', async () => {
      await request(app.getHttpServer())
        .delete(`/listing/${listingWithBookingsId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(400);
    });

    it('should delete listing and all related data, returning 204', async () => {
      await request(app.getHttpServer())
        .delete(`/listing/${listingToDeleteId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(204);

      // Verify listing is gone
      await request(app.getHttpServer())
        .get(`/listing/${listingToDeleteId}`)
        .expect(404);

      // Verify related data is cleaned up
      const calendarSyncs = await dataSource
        .getRepository(CalendarSync)
        .find({ where: { listingId: listingToDeleteId } });
      expect(calendarSyncs).toHaveLength(0);

      const calendarBlocks = await dataSource
        .getRepository(CalendarBlock)
        .find({ where: { listingId: listingToDeleteId } });
      expect(calendarBlocks).toHaveLength(0);

      const bookings = await dataSource
        .getRepository(Booking)
        .find({ where: { listingId: listingToDeleteId } });
      expect(bookings).toHaveLength(0);
    });
  });
});
