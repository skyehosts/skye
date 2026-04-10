import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { mainConfig } from '../src/main.config';
import { AppModule } from '../src/modules/app/app.module';
import { Booking } from '../src/modules/booking/entities/booking.entity';
import {
  CalendarBlock,
  CalendarSync,
} from '../src/modules/calendar-sync/entities';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Listing Unavailability (e2e)', () => {
  let app: INestApplication;
  let hostToken: string;
  let listingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    await app.init();

    const seedService = app.get(E2eSeedService);
    await seedService.resetAndSeed();

    // Login as host to get listing ID
    const hostLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'host@test.com', password: 'Password123!' });
    hostToken = hostLogin.body.payload.accessToken;

    const listingsRes = await request(app.getHttpServer())
      .get('/listing')
      .set('Authorization', `Bearer ${hostToken}`);
    listingId = listingsRes.body.payload.listings[0].id;

    // Create additional test data: a calendar sync + imported block
    const dataSource = app.get(DataSource);

    const syncRepo = dataSource.getRepository(CalendarSync);
    const sync = await syncRepo.save(
      syncRepo.create({
        listingId,
        platform: 'airbnb',
        importUrl: 'https://example.com/airbnb.ics',
        exportToken: 'e2e-test-export-token',
      }),
    );

    const blockRepo = dataSource.getRepository(CalendarBlock);
    await blockRepo.save(
      blockRepo.create({
        listingId,
        calendarSyncId: sync.id,
        source: 'import',
        startDate: '2027-05-10',
        endDate: '2027-05-15',
        summary: 'Reserved',
        externalUid: 'ext-uid-1',
      }),
    );

    // Create a manual block too
    await blockRepo.save(
      blockRepo.create({
        listingId,
        calendarSyncId: null,
        source: 'manual',
        startDate: '2027-06-01',
        endDate: '2027-06-05',
        summary: null,
        externalUid: null,
      }),
    );

    // Create a second booking that overlaps with the imported block
    const bookingRepo = dataSource.getRepository(Booking);
    await bookingRepo.save(
      bookingRepo.create({
        listingId,
        guestId: (
          await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'guest@test.com', password: 'Password123!' })
        ).body.payload.user.id,
        checkInDate: '2027-05-13',
        checkOutDate: '2027-05-18',
        totalPrice: 300,
        numberOfGuests: 2,
        status: 'confirmed',
        createdAt: new Date(),
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // ── PUBLIC ACCESS ─────────────────────────────────────

  describe('GET /listing/:id/unavailability', () => {
    it('should be accessible without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);
    });

    it('should return unavailableDates array', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const data = res.body.payload;
      expect(data).toHaveProperty('unavailableDates');
      expect(Array.isArray(data.unavailableDates)).toBe(true);
    });

    it('should include the seeded booking dates', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const ranges = res.body.payload.unavailableDates;
      // Seeded booking: 2027-04-01 to 2027-04-03
      const hasSeededBooking = ranges.some(
        (r: { startDate: string; endDate: string }) =>
          r.startDate <= '2027-04-01' && r.endDate >= '2027-04-03',
      );
      expect(hasSeededBooking).toBe(true);
    });

    it('should include imported calendar block dates', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const ranges = res.body.payload.unavailableDates;
      // Imported block: 2027-05-10 to 2027-05-15, booking: 2027-05-13 to 2027-05-18
      // These overlap, so they should be merged into one range
      const hasMerged = ranges.some(
        (r: { startDate: string; endDate: string }) =>
          r.startDate === '2027-05-10' && r.endDate === '2027-05-18',
      );
      expect(hasMerged).toBe(true);
    });

    it('should include manual block dates', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const ranges = res.body.payload.unavailableDates;
      // Manual block: 2027-06-01 to 2027-06-05
      const hasManualBlock = ranges.some(
        (r: { startDate: string; endDate: string }) =>
          r.startDate === '2027-06-01' && r.endDate === '2027-06-05',
      );
      expect(hasManualBlock).toBe(true);
    });

    it('should not expose platform or booking details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const ranges = res.body.payload.unavailableDates;
      for (const range of ranges) {
        expect(Object.keys(range)).toEqual(
          expect.arrayContaining(['startDate', 'endDate']),
        );
        expect(range).not.toHaveProperty('platform');
        expect(range).not.toHaveProperty('guestName');
        expect(range).not.toHaveProperty('source');
        expect(range).not.toHaveProperty('summary');
      }
    });

    it('should return ranges sorted by startDate', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${listingId}/unavailability`)
        .expect(200);

      const ranges = res.body.payload.unavailableDates;
      for (let i = 1; i < ranges.length; i++) {
        expect(ranges[i].startDate >= ranges[i - 1].startDate).toBe(true);
      }
    });

    it('should return empty array for listing with no bookings or blocks', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/999999/unavailability`)
        .expect(200);

      expect(res.body.payload.unavailableDates).toEqual([]);
    });
  });
});
