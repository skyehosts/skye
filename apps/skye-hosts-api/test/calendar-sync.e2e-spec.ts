import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { mainConfig } from '../src/main.config';
import { AppModule } from '../src/modules/app/app.module';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Calendar Sync (e2e)', () => {
  let app: INestApplication;
  let hostToken: string;
  let guestToken: string;
  let listingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    await app.init();

    // Reset and seed database
    const seedService = app.get(E2eSeedService);
    await seedService.resetAndSeed();

    // Login as host
    const hostLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'host@test.com', password: 'Password123!' });
    hostToken = hostLogin.body.payload.accessToken;

    // Login as guest
    const guestLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'guest@test.com', password: 'Password123!' });
    guestToken = guestLogin.body.payload.accessToken;

    // Find the seeded listing
    const listingsRes = await request(app.getHttpServer())
      .get('/listing')
      .set('Authorization', `Bearer ${hostToken}`);
    listingId = listingsRes.body.payload.listings[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── SYNC CRUD ─────────────────────────────────────────

  describe('POST /calendar-sync/listing/:listingId (create sync)', () => {
    it('should create a calendar sync connection', async () => {
      const res = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'airbnb',
          label: 'AirBnB Calendar',
          importUrl: 'https://www.airbnb.com/calendar/ical/12345.ics',
        })
        .expect(201);

      const sync = res.body.payload.sync;
      expect(sync.id).toBeDefined();
      expect(sync.platform).toBe('airbnb');
      expect(sync.label).toBe('AirBnB Calendar');
      expect(sync.importUrl).toBe(
        'https://www.airbnb.com/calendar/ical/12345.ics',
      );
      expect(sync.exportUrl).toContain('/calendar-sync/export/');
      expect(sync.exportUrl).toContain('.ics');
      expect(Number(sync.consecutiveFailures)).toBe(0);
    });

    it('should reject invalid platform', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'invalid_platform',
          label: 'Bad',
        })
        .expect(400);
    });

    it('should reject invalid import URL', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'airbnb',
          label: 'Bad URL',
          importUrl: 'not-a-url',
        })
        .expect(400);
    });

    it('should reject creation when importUrl is missing', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'airbnb',
          label: 'No URL',
        })
        .expect(400);
    });
  });

  describe('GET /calendar-sync/export/:token.ics (public export)', () => {
    it('should return iCal feed and record lastExportedAt', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);
      const sync = listRes.body.payload.syncs[0];
      expect(sync.lastExportedAt).toBeNull();

      const token = sync.exportUrl.split('/').pop().replace('.ics', '');

      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/export/${token}.ics`)
        .expect(200);

      expect(res.text).toContain('BEGIN:VCALENDAR');
      expect(res.text).toContain('END:VCALENDAR');

      const afterRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);
      const updated = afterRes.body.payload.syncs.find(
        (s: { id: number }) => s.id === sync.id,
      );
      expect(updated.lastExportedAt).not.toBeNull();
    });

    it('should return 404 for unknown export token', async () => {
      await request(app.getHttpServer())
        .get('/calendar-sync/export/nonexistent-token.ics')
        .expect(404);
    });
  });

  describe('GET /calendar-sync/listing/:listingId (list syncs)', () => {
    it('should return all syncs for listing', async () => {
      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const syncs = res.body.payload.syncs;
      expect(syncs.length).toBeGreaterThanOrEqual(1);
      expect(syncs[0].listingId).toBe(listingId);
    });
  });

  describe('PATCH /calendar-sync/:id (update sync)', () => {
    it('should update sync label and import URL', async () => {
      // Get existing sync
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);
      const syncId = listRes.body.payload.syncs[0].id;

      const res = await request(app.getHttpServer())
        .patch(`/calendar-sync/${syncId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          label: 'Updated Label',
          importUrl: 'https://www.airbnb.com/calendar/ical/99999.ics',
        })
        .expect(200);

      expect(res.body.payload.sync.label).toBe('Updated Label');
      expect(res.body.payload.sync.importUrl).toBe(
        'https://www.airbnb.com/calendar/ical/99999.ics',
      );
    });
  });

  // ── BLOCKS CRUD ───────────────────────────────────────

  describe('POST /calendar-sync/listing/:listingId/blocks (create block)', () => {
    it('should create a manual block', async () => {
      const res = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          startDate: '2027-08-01',
          endDate: '2027-08-05',
        })
        .expect(201);

      const block = res.body.payload.block;
      expect(block.id).toBeDefined();
      expect(block.listingId).toBe(listingId);
      expect(block.source).toBe('manual');
      expect(block.startDate).toBe('2027-08-01');
      expect(block.endDate).toBe('2027-08-05');
      expect(block.calendarSyncId).toBeNull();
    });

    it('should reject block where startDate >= endDate', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          startDate: '2027-08-05',
          endDate: '2027-08-01',
        })
        .expect(400);
    });

    it('should reject block where startDate == endDate', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          startDate: '2027-08-05',
          endDate: '2027-08-05',
        })
        .expect(400);
    });
  });

  describe('GET /calendar-sync/listing/:listingId/blocks (list blocks)', () => {
    it('should return blocks sorted by startDate', async () => {
      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      const blocks = res.body.payload.blocks;
      expect(blocks.length).toBeGreaterThanOrEqual(1);

      for (let i = 1; i < blocks.length; i++) {
        expect(blocks[i].startDate >= blocks[i - 1].startDate).toBe(true);
      }
    });
  });

  describe('DELETE /calendar-sync/blocks/:id (delete block)', () => {
    it('should delete a manual block', async () => {
      // Create a block to delete
      const createRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-12-01', endDate: '2027-12-05' })
        .expect(201);

      const blockId = createRes.body.payload.block.id;

      await request(app.getHttpServer())
        .delete(`/calendar-sync/blocks/${blockId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      // Verify it's gone
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`);

      const remaining = listRes.body.payload.blocks.find(
        (b: { id: number }) => b.id === blockId,
      );
      expect(remaining).toBeUndefined();
    });
  });

  // ── UNBLOCK RANGE ───────────────────────────────────

  describe('POST /calendar-sync/listing/:listingId/blocks/unblock-range', () => {
    it('should unblock a sub-range and split the original block', async () => {
      // Create a large manual block
      const createRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-09-01', endDate: '2027-09-30' })
        .expect(201);

      const originalBlockId = createRes.body.payload.block.id;

      // Unblock the middle portion
      const unblockRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-09-10', endDate: '2027-09-20' })
        .expect(201);

      const blocks = unblockRes.body.payload.blocks;

      // Original block should be gone
      const original = blocks.find(
        (b: { id: number }) => b.id === originalBlockId,
      );
      expect(original).toBeUndefined();

      // Should have two trimmed blocks
      const leftTrim = blocks.find(
        (b: { startDate: string; endDate: string }) =>
          b.startDate === '2027-09-01' && b.endDate === '2027-09-10',
      );
      const rightTrim = blocks.find(
        (b: { startDate: string; endDate: string }) =>
          b.startDate === '2027-09-20' && b.endDate === '2027-09-30',
      );
      expect(leftTrim).toBeDefined();
      expect(leftTrim.source).toBe('manual');
      expect(rightTrim).toBeDefined();
      expect(rightTrim.source).toBe('manual');
    });

    it('should delete a block fully inside the unblock range', async () => {
      // Create a small block
      const createRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-07-10', endDate: '2027-07-15' })
        .expect(201);

      const blockId = createRes.body.payload.block.id;

      // Unblock a wider range
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-07-01', endDate: '2027-07-31' })
        .expect(201);

      // Verify block is gone
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`);

      const remaining = listRes.body.payload.blocks.find(
        (b: { id: number }) => b.id === blockId,
      );
      expect(remaining).toBeUndefined();
    });

    it('should return all blocks when no overlapping manual blocks exist', async () => {
      const res = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2028-01-01', endDate: '2028-01-31' })
        .expect(201);

      expect(res.body.payload.blocks).toBeDefined();
      expect(Array.isArray(res.body.payload.blocks)).toBe(true);
    });

    it('should reject when startDate >= endDate', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-09-20', endDate: '2027-09-10' })
        .expect(400);
    });

    it('should reject when startDate == endDate', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-09-10', endDate: '2027-09-10' })
        .expect(400);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .send({ startDate: '2027-09-10', endDate: '2027-09-20' })
        .expect(401);
    });

    it('should return 403 for guest role', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks/unblock-range`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ startDate: '2027-09-10', endDate: '2027-09-20' })
        .expect(403);
    });
  });

  // ── EXPORT ENDPOINT ───────────────────────────────────

  describe('GET /calendar-sync/export/:exportToken.ics', () => {
    it('should return valid iCal file without authentication', async () => {
      // Get export URL from the sync
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      const sync = listRes.body.payload.syncs[0];
      // Extract just the token from the URL
      const tokenMatch = sync.exportUrl.match(
        /\/calendar-sync\/export\/(.+)\.ics$/,
      );
      const exportToken = tokenMatch[1];

      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/export/${exportToken}.ics`)
        .expect(200);

      expect(res.headers['content-type']).toContain('text/calendar');
      expect(res.text).toContain('BEGIN:VCALENDAR');
      expect(res.text).toContain('END:VCALENDAR');
      expect(res.text).toContain('VERSION:2.0');
      expect(res.text).toContain('PRODID:-//Skye Hosts//Calendar//EN');
    });

    it('should include seeded booking in export', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      const sync = listRes.body.payload.syncs[0];
      const tokenMatch = sync.exportUrl.match(
        /\/calendar-sync\/export\/(.+)\.ics$/,
      );

      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/export/${tokenMatch[1]}.ics`)
        .expect(200);

      // The seeded booking is 2027-04-01 to 2027-04-03
      expect(res.text).toContain('DTSTART;VALUE=DATE:20270401');
      expect(res.text).toContain('DTEND;VALUE=DATE:20270403');
      expect(res.text).toContain('SUMMARY:Reserved');
    });

    it('should NOT include manual blocks in export', async () => {
      // Create a manual block
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-11-01', endDate: '2027-11-05' })
        .expect(201);

      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      const sync = listRes.body.payload.syncs[0];
      const tokenMatch = sync.exportUrl.match(
        /\/calendar-sync\/export\/(.+)\.ics$/,
      );

      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/export/${tokenMatch[1]}.ics`)
        .expect(200);

      // Manual block for 2027-11-01 should NOT appear in export
      expect(res.text).not.toContain('DTSTART;VALUE=DATE:20271101');
      expect(res.text).not.toContain('DTEND;VALUE=DATE:20271105');
    });

    it('should exclude previously-created manual block from export', async () => {
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      const sync = listRes.body.payload.syncs[0];
      const tokenMatch = sync.exportUrl.match(
        /\/calendar-sync\/export\/(.+)\.ics$/,
      );

      const res = await request(app.getHttpServer())
        .get(`/calendar-sync/export/${tokenMatch[1]}.ics`)
        .expect(200);

      // The manual block for 2027-08-01 to 2027-08-05 should NOT be exported
      expect(res.text).not.toContain('DTSTART;VALUE=DATE:20270801');
      expect(res.text).not.toContain('DTEND;VALUE=DATE:20270805');
    });

    it('should return 404 for unknown export token', async () => {
      await request(app.getHttpServer())
        .get('/calendar-sync/export/nonexistent-token.ics')
        .expect(404);
    });
  });

  // ── DELETE SYNC ───────────────────────────────────────

  describe('DELETE /calendar-sync/:id (delete sync)', () => {
    it('should delete the sync and cascade-remove its imported blocks', async () => {
      // Create a fresh sync
      const createRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'booking_com',
          label: 'Booking.com Calendar',
          importUrl: 'https://admin.booking.com/calendar/abc.ics',
        })
        .expect(201);

      const syncId = createRes.body.payload.sync.id;

      await request(app.getHttpServer())
        .delete(`/calendar-sync/${syncId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      // Verify it's gone
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      const remaining = listRes.body.payload.syncs.find(
        (s: { id: number }) => s.id === syncId,
      );
      expect(remaining).toBeUndefined();
    });
  });

  // ── PERMISSIONS ───────────────────────────────────────

  describe('Permission enforcement', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .expect(401);
    });

    it('should return 403 for guest role on host-only endpoints', async () => {
      await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);
    });

    it('should return 403 for guest creating a sync', async () => {
      await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          platform: 'airbnb',
          label: 'Guest attempt',
          importUrl: 'https://www.airbnb.com/calendar/ical/guest.ics',
        })
        .expect(403);
    });
  });
});
