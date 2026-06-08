import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { mainConfig } from '../src/main.config';
import { AccountService } from '../src/modules/account/providers/account.service';
import { AppModule } from '../src/modules/app/app.module';
import { E2eSeedService } from '../src/modules/seed/providers/e2e-seed.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accountService: AccountService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    await app.init();

    accountService = app.get(AccountService);

    const seedService = app.get(E2eSeedService);
    await seedService.resetAndSeed();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Login ──────────────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'Password123!' })
        .expect(201);

      expect(res.body.payload.accessToken).toBeDefined();
      expect(res.body.payload.refreshToken).toBeDefined();
      expect(res.body.payload.user.email).toBe('host@test.com');
    });

    it('should return 401 on wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'WrongPassword!' })
        .expect(401);
    });

    it('should return 401 for an unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'Password123!' })
        .expect(401);
    });
  });

  // ── Protected route access ─────────────────────────────────────────────────

  describe('Bearer token enforcement', () => {
    it('should allow access to a protected route with a valid token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'Password123!' });
      const token = loginRes.body.payload.accessToken;

      await request(app.getHttpServer())
        .get('/listing')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 without an auth token on a protected route', async () => {
      await request(app.getHttpServer()).get('/listing').expect(401);
    });

    it('should return 498 with a malformed token', async () => {
      await request(app.getHttpServer())
        .get('/listing')
        .set('Authorization', 'Bearer not-a-valid-jwt')
        .expect(498);
    });
  });

  // ── Token refresh ──────────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('should issue a new token pair on valid refresh token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'Password123!' });
      const { refreshToken } = loginRes.body.payload;

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(res.body.payload.accessToken).toBeDefined();
      expect(res.body.payload.refreshToken).toBeDefined();
    });

    it('should return 401 when a refresh token is reused, and revoke the new token too', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'guest@test.com', password: 'Password123!' });
      const originalRefreshToken = loginRes.body.payload.refreshToken;

      // First use — issues a new pair
      const firstRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: originalRefreshToken })
        .expect(201);
      const newRefreshToken = firstRefresh.body.payload.refreshToken;

      // Reuse the original token — reuse detected, all sessions revoked
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: originalRefreshToken })
        .expect(401);

      // The freshly issued token is also now invalid (sessions revoked)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401);
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('should revoke the refresh token so it can no longer be used', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'Password123!' });
      const { accessToken, refreshToken } = loginRes.body.payload;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  // ── Password reset ─────────────────────────────────────────────────────────

  describe('POST /auth/reset-password', () => {
    it('should reset the password and invalidate the old one', async () => {
      // Trigger the forgot-password flow to populate the reset token in the DB
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'host@test.com' })
        .expect(201);

      // Read the token directly from the DB (email sending is a TODO in the service)
      const account = await accountService.findByEmail('host@test.com');
      const resetToken = account!.passwordResetToken!;
      expect(resetToken).toBeDefined();

      // Reset to a new password
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: resetToken, password: 'NewPassword456!' })
        .expect(201);

      // Old password no longer works
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'Password123!' })
        .expect(401);

      // New password works
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'host@test.com', password: 'NewPassword456!' })
        .expect(201);
    });

    it('should return 400 for an invalid or expired reset token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'not-a-real-token', password: 'Whatever123!' })
        .expect(400);
    });
  });

  // ── Check email (enumeration surface) ──────────────────────────────────────

  describe('POST /auth/check-email', () => {
    it('should return { exists: true } for a seeded account', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/check-email')
        .send({ email: 'guest@test.com' })
        .expect(201);

      expect(res.body.payload).toEqual({ exists: true });
    });

    it('should return { exists: false } for an unknown email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/check-email')
        .send({ email: 'nobody-ever-seen@test.com' })
        .expect(201);

      expect(res.body.payload).toEqual({ exists: false });
    });

    it('should use an identical response shape for existing vs unknown emails', async () => {
      const found = await request(app.getHttpServer())
        .post('/auth/check-email')
        .send({ email: 'guest@test.com' });
      const missing = await request(app.getHttpServer())
        .post('/auth/check-email')
        .send({ email: 'nobody-ever-seen@test.com' });

      expect(found.status).toBe(missing.status);
      expect(Object.keys(found.body).sort()).toEqual(
        Object.keys(missing.body).sort(),
      );
      expect(Object.keys(found.body.payload).sort()).toEqual(
        Object.keys(missing.body.payload).sort(),
      );
      expect(found.body.payload.exists).toBe(true);
      expect(missing.body.payload.exists).toBe(false);
    });

    it('should return 400 for a malformed email', async () => {
      await request(app.getHttpServer())
        .post('/auth/check-email')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('should rate limit bursts of requests', async () => {
      let rateLimitedCount = 0;
      for (let i = 0; i < 35; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/check-email')
          .send({ email: 'burst@test.com' });
        if (res.status === 429) rateLimitedCount++;
      }
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });
});
