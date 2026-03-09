import { expect, test } from '@playwright/test';

test('homepage is publicly accessible', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL('/');
});

test.describe('Glamping website — auth API routes', () => {
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
});
