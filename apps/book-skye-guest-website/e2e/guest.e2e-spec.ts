import { expect, test } from '@playwright/test';

test.describe('Guest website — route protection', () => {
  test('/account redirects to /login when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Faccount/);
  });
});

test('homepage is publicly accessible', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL('/');
});

test.describe('Guest website — auth API routes', () => {
  test('/api/auth/session returns empty session', async ({ request }) => {
    const response = await request.get('/api/auth/session');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  test('/api/auth/providers returns credentials provider', async ({
    request,
  }) => {
    const response = await request.get('/api/auth/providers');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('credentials');
  });

  test('/api/auth/csrf returns a csrf token', async ({ request }) => {
    const response = await request.get('/api/auth/csrf');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('csrfToken');
    expect(typeof body.csrfToken).toBe('string');
  });
});
