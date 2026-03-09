import { test, expect } from "@playwright/test";

test.describe("Admin website — route protection (all protected)", () => {
  test("homepage redirects to /login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/dashboard redirects to /login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
  });

  test("/users redirects to /login when unauthenticated", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fusers/);
  });

  test("/settings redirects to /login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsettings/);
  });

  test("arbitrary path redirects to /login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/anything/deep/path");
    await expect(page).toHaveURL(/\/login\?callbackUrl/);
  });
});

test.describe("Admin website — auth API routes are accessible", () => {
  test("/api/auth/session returns empty session", async ({ request }) => {
    const response = await request.get("/api/auth/session");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeNull();
  });

  test("/api/auth/providers returns credentials provider", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("credentials");
  });

  test("/api/auth/csrf returns a csrf token", async ({ request }) => {
    const response = await request.get("/api/auth/csrf");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("csrfToken");
  });
});
