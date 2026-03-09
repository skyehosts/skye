import { expect, test } from "@playwright/test";

/**
 * These tests verify the applyServerErrors pattern:
 * the frontend has no validation rules, so all validation is deferred to
 * the API. The API response is mocked to return field-level errors, and the
 * tests assert those errors appear inline on the correct fields.
 *
 * The mock returns a 400 IApiValidationErrorResponse, which fetchApi parses
 * into an ApiValidationError. applyServerErrors then maps each fieldError
 * onto the corresponding react-hook-form field via setError().
 */

const API_BASE = "http://localhost:3003";

/** Shape returned by the real API when class-validator rejects the body. */
const MOCK_VALIDATION_RESPONSE = {
  statusCode: 400,
  error: "Bad Request",
  message: [
    {
      property: "name",
      constraints: { maxLength: "name must be shorter than 100 characters" },
    },
    {
      property: "email",
      constraints: { isEmail: "email must be an email" },
    },
    {
      property: "age",
      constraints: { min: "age must not be less than 18" },
    },
    {
      property: "message",
      constraints: {
        maxLength: "message must be shorter than 1000 characters",
      },
    },
  ],
};

/** Fill every field with values that satisfy the client-side validation rules. */
async function fillValidForm(page: import("@playwright/test").Page) {
  // react-native-paper v5 applies testID directly to the <input>/<textarea>
  // element itself, not a wrapper — so [data-testid="..."] IS the input.
  await page.locator('[data-testid="demo-name-input"]').fill("John Smith");
  await page
    .locator('[data-testid="demo-email-input"]')
    .fill("john@example.com");
  await page.locator('[data-testid="demo-age-input"]').fill("30");
  await page.locator('[data-testid="demo-message-input"]').fill("Hello there");
}

test.describe("Demo form — applyServerErrors (server-side validation)", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the form submission and always return validation errors.
    // This lets us test the error-mapping path without a running API.
    await page.route(`${API_BASE}/demo/form`, (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(MOCK_VALIDATION_RESPONSE),
      }),
    );

    await page.goto("/demo");
  });

  test("server field errors are mapped onto the correct form fields", async ({
    page,
  }) => {
    await fillValidForm(page);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.locator('[data-testid="demo-name-error"]')).toHaveText(
      "name must be shorter than 100 characters",
    );

    await expect(page.locator('[data-testid="demo-email-error"]')).toHaveText(
      "email must be an email",
    );

    await expect(page.locator('[data-testid="demo-age-error"]')).toHaveText(
      "age must not be less than 18",
    );

    await expect(page.locator('[data-testid="demo-message-error"]')).toHaveText(
      "message must be shorter than 1000 characters",
    );
  });

  test("generic snackbar is suppressed when all errors are field-level", async ({
    page,
  }) => {
    await fillValidForm(page);
    await page.getByRole("button", { name: "Submit" }).click();

    // applyServerErrors returned true, so the catch block returned early
    // without calling setServerError — snackbar should stay hidden.
    await expect(page.getByText("Something went wrong")).not.toBeVisible();

    // Field errors must still be present to confirm we did submit.
    await expect(page.locator('[data-testid="demo-name-error"]')).toBeVisible();
  });

  test("each error appears under its own field, not on others", async ({
    page,
  }) => {
    await fillValidForm(page);
    await page.getByRole("button", { name: "Submit" }).click();

    // name error must not bleed into the email field's error slot
    await expect(
      page.locator('[data-testid="demo-email-error"]'),
    ).not.toHaveText("name must be shorter than 100 characters");

    // age error must not appear under the message field
    await expect(
      page.locator('[data-testid="demo-message-error"]'),
    ).not.toHaveText("age must not be less than 18");
  });
});
