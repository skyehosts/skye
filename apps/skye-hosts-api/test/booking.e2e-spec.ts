import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { mainConfig } from '../src/main.config';
import { AppModule } from '../src/modules/app/app.module';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Booking (e2e)', () => {
  let app: INestApplication;
  let hostToken: string;
  let guestToken: string;
  let cohostToken: string;
  let listingId: number;
  let bookingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    await app.init();

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

    const cohostLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cohost@test.com', password: 'Password123!' });
    cohostToken = cohostLogin.body.payload.accessToken;

    // Resolve listingId and bookingId from seeded data
    const listingsRes = await request(app.getHttpServer())
      .get('/listing')
      .set('Authorization', `Bearer ${hostToken}`);
    listingId = listingsRes.body.payload.listings[0].id;

    const bookingsRes = await request(app.getHttpServer())
      .get(`/booking/listing/${listingId}`)
      .set('Authorization', `Bearer ${hostToken}`);
    bookingId = bookingsRes.body.payload.bookings[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /booking/:id ───────────────────────────────────────────────────────

  describe('GET /booking/:id', () => {
    it('should return the booking for the guest who made it', async () => {
      const res = await request(app.getHttpServer())
        .get(`/booking/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(res.body.payload.id).toBe(bookingId);
      expect(res.body.payload.status).toBe('confirmed');
      expect(res.body.payload.checkInDate).toBe('2027-04-01');
      expect(res.body.payload.checkOutDate).toBe('2027-04-03');
    });

    it('should return the booking for the host of the listing', async () => {
      const res = await request(app.getHttpServer())
        .get(`/booking/${bookingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(res.body.payload.id).toBe(bookingId);
    });

    it('should return 403 for an authenticated user who is neither guest nor host', async () => {
      await request(app.getHttpServer())
        .get(`/booking/${bookingId}`)
        .set('Authorization', `Bearer ${cohostToken}`)
        .expect(403);
    });

    it('should return 401 without an auth token', async () => {
      await request(app.getHttpServer())
        .get(`/booking/${bookingId}`)
        .expect(401);
    });
  });

  // ── GET /booking/listing/:listingId ───────────────────────────────────────

  describe('GET /booking/listing/:listingId', () => {
    it('should return all bookings for the listing when requested by the host', async () => {
      const res = await request(app.getHttpServer())
        .get(`/booking/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const bookings = res.body.payload.bookings;
      expect(bookings.length).toBeGreaterThanOrEqual(1);
      expect(bookings[0].checkInDate).toBe('2027-04-01');
      expect(bookings[0].checkOutDate).toBe('2027-04-03');
    });

    it('should return 403 when a guest requests the listing bookings', async () => {
      await request(app.getHttpServer())
        .get(`/booking/listing/${listingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });
  });
});
