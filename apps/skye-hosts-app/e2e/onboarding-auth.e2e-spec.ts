import { expect, test, type Page } from "@playwright/test";

const API_BASE = "http://localhost:3003";
const TEST_OTP = "000000";

// Seeded by e2e-seed.service.ts
const HOST_PHONE = "+447700900001";
const HOST_PIN = "1234";
const GUEST_PHONE = "+447700900002";
const NEW_USER_PHONE = "+447700900099";

/**
 * Skip onboarding and mark the app as installed via localStorage.
 * AsyncStorage on web uses localStorage with raw JSON string values.
 */
async function skipOnboarding(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("onboarding_seen", "true");
    localStorage.setItem("app_installed", "true");
  });
}

/**
 * Complete the phone entry step on the sign-up screen.
 * autoComplete="tel" reliably maps to autocomplete="tel" on web via react-native-web.
 */
async function enterPhone(page: Page, phone: string) {
  await page.getByText("Enter your mobile number to continue").waitFor();
  await page.locator('input[autocomplete="tel"]').fill(phone);
  await page.getByRole("button", { name: "Continue" }).click();
}

/**
 * Complete the OTP verification step.
 * The input auto-submits when 6 chars are entered — no button click needed.
 */
async function enterOtp(page: Page) {
  await page.getByText("Enter verification code").waitFor();
  // OTP input: keyboardType="number-pad", not secureTextEntry → plain text input
  await page.locator('input:not([type="password"])').first().fill(TEST_OTP);
  // Auto-submits on 6 chars, page navigates automatically
}

/**
 * Complete the PIN setup step (create + confirm).
 * secureTextEntry maps to type="password" on web.
 */
async function createPin(page: Page, pin: string) {
  await page.getByText("Create a PIN").waitFor();
  await page.locator('input[type="password"]').first().fill(pin);
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByText("Confirm your PIN").waitFor();
  await page.locator('input[type="password"]').first().fill(pin);
  await page.getByRole("button", { name: "Set PIN" }).click();
}

/**
 * Wait for the main app screen (Today tab) to confirm auth is complete.
 * On web, biometrics are unavailable so biometric-setup auto-skips.
 */
async function expectTodayScreen(page: Page) {
  await expect(page.getByText("Today")).toBeVisible({ timeout: 10_000 });
}

test.describe("Onboarding & authentication flows", () => {
  test.beforeEach(async ({ page }) => {
    // Reset the e2e database before each test for isolation
    const res = await fetch(`${API_BASE}/seed/e2e-reset`, { method: "POST" });
    if (!res.ok) throw new Error(`Seed reset failed: ${res.status}`);
  });

  test("Flow 1: New user — phone → name → OTP → PIN setup → app", async ({
    page,
  }) => {
    await page.goto("/");
    await skipOnboarding(page);
    await page.goto("/");

    // Step 1: Enter phone number (new number, not in DB)
    await enterPhone(page, NEW_USER_PHONE);

    // Step 2: App detects new user — shows name field
    await page.getByText("One more thing").waitFor();
    const nameInput = page.locator('input[autocomplete="name"]');
    await nameInput.fill("New Test User");
    await page.getByRole("button", { name: "Send verification code" }).click();

    // Step 3: OTP verification
    await enterOtp(page);

    // Step 4: PIN setup (new user has no PIN)
    await createPin(page, "5678");

    // Step 5: Biometrics auto-skipped on web → lands on Today
    await expectTodayScreen(page);
  });

  test("Flow 2: Returning user with PIN — phone → OTP → PIN unlock → app", async ({
    page,
  }) => {
    await page.goto("/");
    await skipOnboarding(page);
    await page.goto("/");

    // Step 1: Enter existing host phone
    await enterPhone(page, HOST_PHONE);

    // Step 2: Existing user — app sends OTP directly (no name field)
    await enterOtp(page);

    // Step 3: Server returned PIN data → app goes to unlock (not setup)
    // Biometrics not available on web → redirects to pin-unlock
    await page.getByText("Enter your PIN to continue").waitFor();
    await page.locator('input[type="password"]').first().fill(HOST_PIN);
    await page.getByRole("button", { name: "Unlock" }).click();

    // Step 4: Lands on Today
    await expectTodayScreen(page);
  });

  test("Flow 3: Returning user on new device — server PIN restored → PIN unlock → app", async ({
    page,
  }) => {
    // This simulates a "new device" — localStorage is empty (no cached PIN).
    // The server should return the PIN hash+salt in the verify-otp response,
    // and the app should restore it locally and go to PIN unlock (not setup).
    await page.goto("/");
    await skipOnboarding(page);
    await page.goto("/");

    // Step 1: Enter existing host phone
    await enterPhone(page, HOST_PHONE);

    // Step 2: OTP verification
    await enterOtp(page);

    // Step 3: Should go to PIN unlock (not PIN setup), because server returned PIN data
    await page.getByText("Enter your PIN to continue").waitFor();
    await page.locator('input[type="password"]').first().fill(HOST_PIN);
    await page.getByRole("button", { name: "Unlock" }).click();

    await expectTodayScreen(page);
  });

  test("Flow 4: Different user on same device — old PIN cleared → new PIN setup", async ({
    page,
  }) => {
    // First: sign in as host (who has a PIN) to populate local storage
    await page.goto("/");
    await skipOnboarding(page);
    await page.goto("/");

    await enterPhone(page, HOST_PHONE);
    await enterOtp(page);

    // Host has PIN from server → PIN unlock
    await page.getByText("Enter your PIN to continue").waitFor();
    await page.locator('input[type="password"]').first().fill(HOST_PIN);
    await page.getByRole("button", { name: "Unlock" }).click();
    await expectTodayScreen(page);

    // Now simulate sign-out by clearing session data but keeping PIN in localStorage.
    // Navigate to root to trigger the auth redirect.
    await page.evaluate(() => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("pin_attempt_count");
    });
    await page.goto("/");

    // Sign in as guest (who does NOT have a PIN)
    await enterPhone(page, GUEST_PHONE);
    await enterOtp(page);

    // Guest has no server-side PIN, and host's local PIN doesn't belong to guest.
    // App should clear old PIN and show PIN setup (not unlock).
    await page.getByText("Create a PIN").waitFor({ timeout: 10_000 });
    await createPin(page, "9999");

    // Biometrics auto-skipped → Today
    await expectTodayScreen(page);
  });
});
