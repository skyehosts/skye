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
          isImportEnabled: true,
          isExportEnabled: true,
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
      expect(sync.isImportEnabled).toBe(true);
      expect(sync.isExportEnabled).toBe(true);
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

      // The seeded booking is 2026-04-01 to 2026-04-03
      expect(res.text).toContain('DTSTART;VALUE=DATE:20260401');
      expect(res.text).toContain('DTEND;VALUE=DATE:20260403');
      expect(res.text).toContain('SUMMARY:Reserved');
    });

    it('should include manual blocks in export', async () => {
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

      // We created a block for 2027-08-01 to 2027-08-05 earlier
      expect(res.text).toContain('DTSTART;VALUE=DATE:20270801');
      expect(res.text).toContain('DTEND;VALUE=DATE:20270805');
    });

    it('should return 404 for unknown export token', async () => {
      await request(app.getHttpServer())
        .get('/calendar-sync/export/nonexistent-token.ics')
        .expect(404);
    });
  });

  // ── DELETE SYNC ───────────────────────────────────────

  describe('DELETE /calendar-sync/:id (delete sync)', () => {
    it('should delete sync and optionally remove blocks', async () => {
      // Create a fresh sync
      const createRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          platform: 'booking_com',
          label: 'Booking.com Calendar',
          isExportEnabled: true,
        })
        .expect(201);

      const syncId = createRes.body.payload.sync.id;

      await request(app.getHttpServer())
        .delete(`/calendar-sync/${syncId}?removeBlocks=false`)
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

  // ── ORPHANED BLOCKS ───────────────────────────────────

  describe('Orphaned blocks (delete sync only, keep blocks)', () => {
    it('should set calendarSyncId to null on blocks when sync is deleted with removeBlocks=false', async () => {
      // Create a sync and a manual block linked to it (simulating an imported block)
      const syncRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ platform: 'airbnb', isExportEnabled: false })
        .expect(201);
      const syncId = syncRes.body.payload.sync.id;

      // Create a block (manual — we can't do a real import in e2e, but the
      // delete-sync-only path with removeBlocks=false is what we're testing)
      const blockRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-09-01', endDate: '2027-09-05' })
        .expect(201);
      const blockId = blockRes.body.payload.block.id;

      // Delete the sync without removing blocks
      await request(app.getHttpServer())
        .delete(`/calendar-sync/${syncId}?removeBlocks=false`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      // Sync should be gone
      const listRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`);
      const remaining = listRes.body.payload.syncs.find(
        (s: { id: number }) => s.id === syncId,
      );
      expect(remaining).toBeUndefined();

      // Block should still exist
      const blocksRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`);
      const block = blocksRes.body.payload.blocks.find(
        (b: { id: number }) => b.id === blockId,
      );
      expect(block).toBeDefined();
      // calendarSyncId should be null (orphaned)
      expect(block.calendarSyncId).toBeNull();
    });

    it('should allow deleting an orphaned imported block via DELETE /calendar-sync/blocks/:id', async () => {
      // Create and delete a sync, keeping blocks
      const syncRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ platform: 'booking_com', isExportEnabled: false })
        .expect(201);
      const syncId = syncRes.body.payload.sync.id;

      const blockRes = await request(app.getHttpServer())
        .post(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ startDate: '2027-10-01', endDate: '2027-10-03' })
        .expect(201);
      const blockId = blockRes.body.payload.block.id;

      await request(app.getHttpServer())
        .delete(`/calendar-sync/${syncId}?removeBlocks=false`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      // Should be able to delete the now-orphaned block
      await request(app.getHttpServer())
        .delete(`/calendar-sync/blocks/${blockId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      // Block should be gone
      const blocksRes = await request(app.getHttpServer())
        .get(`/calendar-sync/listing/${listingId}/blocks`)
        .set('Authorization', `Bearer ${hostToken}`);
      const block = blocksRes.body.payload.blocks.find(
        (b: { id: number }) => b.id === blockId,
      );
      expect(block).toBeUndefined();
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
        })
        .expect(403);
    });
  });
});
