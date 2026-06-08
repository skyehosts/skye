import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { mainConfig } from '../src/main.config';
import { AppModule } from '../src/modules/app/app.module';
import { Listing } from '../src/modules/listing/entities';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Listing Pricing (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let hostToken: string;
  let guestToken: string;
  let cohostToken: string;
  let pricedListingId: number;
  let unpricedListingId: number;

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

    const login = (email: string) =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123!' });

    const [hostLogin, guestLogin, cohostLogin] = await Promise.all([
      login('host@test.com'),
      login('guest@test.com'),
      login('cohost@test.com'),
    ]);
    hostToken = hostLogin.body.payload.accessToken;
    guestToken = guestLogin.body.payload.accessToken;
    cohostToken = cohostLogin.body.payload.accessToken;

    const listings = await dataSource.getRepository(Listing).find();
    pricedListingId = listings.find(
      (l) => l.title === 'E2E Test Glamping Pod',
    ).id;
    unpricedListingId = listings.find(
      (l) => l.title === 'E2E Unpriced Draft Listing',
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /listing/:id/pricing', () => {
    it('returns the full pricing config for the host', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const payload = res.body.payload;
      expect(payload.isComplete).toBe(true);
      expect(payload.seasons).toHaveLength(3);
      expect(payload.globals.cleaningFeePound).toBe(25);
      expect(payload.overrideCount).toBe(0);
    });

    it('reports isComplete=false for a listing without season rows', async () => {
      const res = await request(app.getHttpServer())
        .get(`/listing/${unpricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(res.body.payload.isComplete).toBe(false);
      expect(res.body.payload.seasons).toHaveLength(0);
    });

    it('returns 403 for a non-host', async () => {
      await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });

    it('returns 403 for an authenticated user without listing access', async () => {
      await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${cohostToken}`)
        .expect(403);
    });

    it('returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .expect(401);
    });
  });

  describe('PUT /listing/:id/pricing/seasons/:season', () => {
    it('upserts a season and is observable via GET', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${unpricedListingId}/pricing/seasons/peak`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ weekdayPricePence: 13000, weekendPricePence: 16000 })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/listing/${unpricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const peak = res.body.payload.seasons.find(
        (s: { season: string }) => s.season === 'peak',
      );
      expect(peak).toBeDefined();
      expect(peak.weekdayPricePence).toBe(13000);
      expect(peak.weekendPricePence).toBe(16000);
      expect(res.body.payload.isComplete).toBe(false);
    });

    it('updates an existing season row (second PUT overwrites)', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/seasons/peak`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ weekdayPricePence: 20000, weekendPricePence: 25000 })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const peak = res.body.payload.seasons.find(
        (s: { season: string }) => s.season === 'peak',
      );
      expect(peak.weekdayPricePence).toBe(20000);
      expect(peak.weekendPricePence).toBe(25000);

      // Restore seeded value so later tests keep their expected breakdown
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/seasons/peak`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ weekdayPricePence: 12000, weekendPricePence: 15000 })
        .expect(204);
    });

    it('rejects negative prices with 400', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/seasons/peak`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ weekdayPricePence: -1, weekendPricePence: 100 })
        .expect(400);
    });

    it('returns 403 for non-host', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/seasons/peak`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ weekdayPricePence: 1, weekendPricePence: 2 })
        .expect(403);
    });
  });

  describe('PUT /listing/:id/pricing/discounts', () => {
    it('persists discount settings', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/discounts`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          lastMinuteEnabled: true,
          lastMinutePercent: 7,
          weeklyEnabled: false,
          weeklyPercent: 10,
          monthlyEnabled: false,
          monthlyPercent: 20,
        })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(res.body.payload.globals.lastMinuteEnabled).toBe(true);
      expect(res.body.payload.globals.lastMinutePercent).toBe(7);

      // Reset to seeded defaults
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/discounts`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          lastMinuteEnabled: false,
          lastMinutePercent: 5,
          weeklyEnabled: false,
          weeklyPercent: 10,
          monthlyEnabled: false,
          monthlyPercent: 20,
        })
        .expect(204);
    });

    it('rejects percent > 100', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/discounts`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          lastMinuteEnabled: true,
          lastMinutePercent: 150,
          weeklyEnabled: false,
          weeklyPercent: 10,
          monthlyEnabled: false,
          monthlyPercent: 20,
        })
        .expect(400);
    });
  });

  describe('PUT /listing/:id/pricing/cleaning-fee', () => {
    afterAll(async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 25 })
        .expect(204);
    });

    it('persists the cleaning fee and is observable via GET', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 45 })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/listing/${pricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);
      expect(res.body.payload.globals.cleaningFeePound).toBe(45);
    });

    it('accepts 0 (used as the "not set" sentinel)', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${unpricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 0 })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/listing/${unpricedListingId}/pricing`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);
      expect(res.body.payload.globals.cleaningFeePound).toBe(0);
    });

    it('rejects a negative value with 400', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: -1 })
        .expect(400);
    });

    it('rejects a value above the 500 maximum with 400', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 501 })
        .expect(400);
    });

    it('rejects a non-integer value with 400', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 10.5 })
        .expect(400);
    });

    it('rejects a missing body field with 400', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({})
        .expect(400);
    });

    it('returns 403 for non-host', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ cleaningFeePound: 30 })
        .expect(403);
    });

    it('returns 403 for an authenticated user without listing access', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${cohostToken}`)
        .send({ cleaningFeePound: 30 })
        .expect(403);
    });

    it('returns 401 without auth', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .send({ cleaningFeePound: 30 })
        .expect(401);
    });

    it('is reflected in a subsequent quote breakdown', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/pricing/cleaning-fee`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ cleaningFeePound: 40 })
        .expect(204);

      const res = await request(app.getHttpServer())
        .post(`/listing/${pricedListingId}/quote`)
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(201);

      const q = res.body.payload;
      expect(q.cleaningFeePound).toBe(40);
      expect(q.hostNetSubtotalPence).toBe(q.nightlyRateSumPence + 40 * 100);
    });
  });

  describe('Overrides CRUD', () => {
    it('upserts, lists, and deletes overrides by date', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/overrides`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          dates: ['2027-05-10', '2027-05-11', '2027-05-12'],
          pricePence: 18000,
        })
        .expect(204);

      const listRes = await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/overrides?from=2027-05-01&to=2027-05-31`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(listRes.body.payload.overrides).toHaveLength(3);
      expect(
        listRes.body.payload.overrides.map((o: { date: string }) => o.date),
      ).toEqual(['2027-05-10', '2027-05-11', '2027-05-12']);
      expect(listRes.body.payload.overrides[0].pricePence).toBe(18000);

      // Second PUT mixes one update (05-11) with one insert (05-13).
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/overrides`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ dates: ['2027-05-11', '2027-05-13'], pricePence: 22000 })
        .expect(204);

      const afterRes = await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/overrides?from=2027-05-01&to=2027-05-31`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);
      const byDate: Record<string, number> = Object.fromEntries(
        afterRes.body.payload.overrides.map(
          (o: { date: string; pricePence: number }) => [o.date, o.pricePence],
        ),
      );
      expect(byDate['2027-05-10']).toBe(18000);
      expect(byDate['2027-05-11']).toBe(22000);
      expect(byDate['2027-05-12']).toBe(18000);
      expect(byDate['2027-05-13']).toBe(22000);

      await request(app.getHttpServer())
        .delete(`/listing/${pricedListingId}/overrides`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ dates: ['2027-05-10', '2027-05-11'] })
        .expect(204);

      const afterDeleteRes = await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/overrides?from=2027-05-01&to=2027-05-31`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);
      expect(
        afterDeleteRes.body.payload.overrides.map(
          (o: { date: string }) => o.date,
        ),
      ).toEqual(['2027-05-12', '2027-05-13']);

      await request(app.getHttpServer())
        .delete(`/listing/${pricedListingId}/overrides`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ dates: ['2027-05-12', '2027-05-13'] })
        .expect(204);
    });

    it('returns 403 for non-host on PUT', async () => {
      await request(app.getHttpServer())
        .put(`/listing/${pricedListingId}/overrides`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ dates: ['2027-06-01'], pricePence: 10000 })
        .expect(403);
    });

    it('rejects non-ISO date strings with 400', async () => {
      await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/overrides?from=not-a-date&to=2027-12-31`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(400);
    });
  });

  describe('GET /listing/:id/calendar-prices', () => {
    it('returns per-date prices reflecting weekend vs weekday', async () => {
      // 2027-07-02=Fri, 07-03=Sat, 07-04=Sun, 07-05=Mon. Weekend nights = Fri+Sat only.
      const res = await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/calendar-prices?from=2027-07-02&to=2027-07-06`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const prices = res.body.payload.prices;
      expect(prices).toHaveLength(4);
      const byDate: Record<
        string,
        { hostNetPence: number; isWeekend: boolean; isOverride: boolean }
      > = Object.fromEntries(
        prices.map(
          (p: {
            date: string;
            hostNetPence: number;
            isWeekend: boolean;
            isOverride: boolean;
          }) => [p.date, p],
        ),
      );
      expect(byDate['2027-07-02'].hostNetPence).toBe(15000);
      expect(byDate['2027-07-02'].isWeekend).toBe(true);
      expect(byDate['2027-07-05'].hostNetPence).toBe(12000);
      expect(byDate['2027-07-05'].isWeekend).toBe(false);
    });

    it('returns 400 when from/to is invalid', async () => {
      await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/calendar-prices?from=2027-07-05&to=2027-07-05`,
        )
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(400);
    });

    it('returns 403 for non-host', async () => {
      await request(app.getHttpServer())
        .get(
          `/listing/${pricedListingId}/calendar-prices?from=2027-07-02&to=2027-07-06`,
        )
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });
  });

  describe('POST /listing/:id/quote (public)', () => {
    it('returns a breakdown with short-stay guest fee for a 1-night stay', async () => {
      const res = await request(app.getHttpServer())
        .post(`/listing/${pricedListingId}/quote`)
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(201);

      const q = res.body.payload;
      expect(q.nights).toHaveLength(1);
      expect(q.nights[0].season).toBe('peak');
      expect(q.nightlyRateSumPence).toBe(12000);
      expect(q.guestFeeRate).toBe(0.03);
      expect(q.totalGuestPence).toBeGreaterThan(0);
      expect(q.currency).toBe('GBP');
    });

    it('drops to zero guest fee at the 3-night tier', async () => {
      const res = await request(app.getHttpServer())
        .post(`/listing/${pricedListingId}/quote`)
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-08',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(201);

      expect(res.body.payload.nights).toHaveLength(3);
      expect(res.body.payload.guestFeeRate).toBe(0);
      expect(res.body.payload.guestFeePence).toBe(0);
    });

    it('works without auth (public endpoint)', async () => {
      await request(app.getHttpServer())
        .post(`/listing/${pricedListingId}/quote`)
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(201);
    });

    it('returns 400 for an unpriced listing', async () => {
      await request(app.getHttpServer())
        .post(`/listing/${unpricedListingId}/quote`)
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(400);
    });

    it('returns 404 for a non-existent listing', async () => {
      await request(app.getHttpServer())
        .post('/listing/999999/quote')
        .send({
          checkInDate: '2027-07-05',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(404);
    });

    it('rejects invalid check-in/check-out date strings', async () => {
      await request(app.getHttpServer())
        .post(`/listing/${pricedListingId}/quote`)
        .send({
          checkInDate: 'not-a-date',
          checkOutDate: '2027-07-06',
          guestCount: { adults: 2, children: 0, babies: 0 },
        })
        .expect(400);
    });
  });

  describe('Publishing guard', () => {
    it('rejects activation of a listing without complete pricing', async () => {
      await request(app.getHttpServer())
        .patch(`/listing/${unpricedListingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ status: 'active' })
        .expect(400);
    });

    it('allows activation once all three seasons are set', async () => {
      await Promise.all(
        (['low', 'shoulder', 'peak'] as const).map((season) =>
          request(app.getHttpServer())
            .put(`/listing/${unpricedListingId}/pricing/seasons/${season}`)
            .set('Authorization', `Bearer ${hostToken}`)
            .send({ weekdayPricePence: 8000, weekendPricePence: 10000 })
            .expect(204),
        ),
      );

      await request(app.getHttpServer())
        .patch(`/listing/${unpricedListingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ status: 'active' })
        .expect(200);
    });
  });
});
