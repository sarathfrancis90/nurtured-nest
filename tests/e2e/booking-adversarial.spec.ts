import { expect, test } from '@playwright/test';

const futureSlot = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();

function mockSlots(page: import('@playwright/test').Page, slots: Array<{ start_at_utc: string; end_at_utc: string; local_label: string }>) {
  return page.route('**/api/bookings/availability*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          slots,
        },
      }),
    });
  });
}

function mockBookingEndpoint(
  page: import('@playwright/test').Page,
  routeHandler: (request: import('@playwright/test').Route, requestPayload: Record<string, unknown>) => Promise<void> | void
) {
  return page.route('**/api/bookings', async (route) => {
    const post = route.request().method();
    if (post !== 'POST') {
      return route.continue();
    }

    const text = route.request().postData();
    const parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    return routeHandler(route, parsed);
  });
}

test('No slot selected blocks progression and shows inline guidance', async ({ page }) => {
  await mockSlots(page, []);
  await page.goto('/book');

  const continueBtn = page.getByRole('button', { name: /continue/i });
  await expect(continueBtn).toBeDisabled();
  await continueBtn.click({ force: true });

  await expect(page.getByText(/no openings on this day/i)).toBeVisible();
});

test('Validation errors are strict and block posting malformed client details', async ({ page }) => {
  await mockSlots(page, [
    {
      start_at_utc: futureSlot,
      end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 12 + 15 * 60 * 1000).toISOString(),
      local_label: 'Noon',
    },
  ]);

  let createCalls = 0;
  await mockBookingEndpoint(page, () => {
    createCalls += 1;
    return; // should stay at 0 in this test
  });

  await page.goto('/book');

  await page.locator('button.slot-button').click();
  await page.getByRole('button', { name: /continue to your details/i }).click();

  await page.getByLabel(/full name/i).fill('J');
  await page.getByRole('textbox', { name: /email address/i }).fill('bad-email');
  await page.getByRole('button', { name: /review booking/i }).click();

  await expect(page.getByText(/please enter your full name/i)).toBeVisible();
  await expect(page.getByText(/please provide a valid email address/i)).toBeVisible();
  expect(createCalls).toBe(0);
});

test('Rapid confirm-click is collapsed to one network call', async ({ page }) => {
  await mockSlots(page, [
    {
      start_at_utc: futureSlot,
      end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 12 + 30 * 60 * 1000).toISOString(),
      local_label: 'Morning',
    },
  ]);

  let createCalls = 0;
  await mockBookingEndpoint(page, async (route) => {
    createCalls += 1;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          booking_id: '00000000-0000-4000-8000-000000000002',
          reference_code: 'NN-20260729-RAPID',
          status: 'pending_confirmation',
          starts_at_utc: futureSlot,
          manage_token: 'manage-token-rapid',
          confirm_token: 'confirm-token-rapid',
          client_manage_url: '/book/manage/00000000-0000-4000-8000-000000000002?token=manage-token-rapid',
        },
        request_id: 'e2e-rapid',
      }),
    });
  });

  await page.goto('/book');

  await page.locator('button.slot-button').click();
  await page.getByRole('button', { name: /continue to your details/i }).click();
  await page.getByLabel(/full name/i).fill('Ava Johnson');
  await page.getByRole('textbox', { name: /email address/i }).fill('ava.johnson@example.com');

  await page.getByRole('button', { name: /review booking/i }).click();
  await page.getByRole('button', { name: /confirm booking/i }).dblclick();

  await expect(page.getByRole('heading', { name: /booking request received/i })).toBeVisible();
  expect(createCalls).toBe(1);
});

test('Server-side idempotency and conflict response stays actionable', async ({ page }) => {
  await mockSlots(page, [
    {
      start_at_utc: futureSlot,
      end_at_utc: new Date(Date.now() + 1000 * 60 * 60 * 12 + 30 * 60 * 1000).toISOString(),
      local_label: 'Morning',
    },
  ]);

  let createCalls = 0;
  await mockBookingEndpoint(page, async (route) => {
    createCalls += 1;
    await route.fulfill({
      status: createCalls === 1 ? 201 : 409,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: createCalls === 1,
        data:
          createCalls === 1
            ? {
                booking_id: '00000000-0000-4000-8000-000000000003',
                reference_code: 'NN-20260729-IDEMP',
                status: 'pending_confirmation',
                starts_at_utc: futureSlot,
                manage_token: 'manage-token-idem',
                confirm_token: 'confirm-token-idem',
                client_manage_url: '/book/manage/00000000-0000-4000-8000-000000000003?token=manage-token-idem',
              }
            : undefined,
        request_id: 'e2e-idempotent',
        error: createCalls > 1 ? { code: 'idempotency_conflict', message: 'Request duplicated by same key' } : undefined,
      }),
    });
  });

  await page.goto('/book');

  await page.locator('button.slot-button').click();
  await page.getByRole('button', { name: /continue to your details/i }).click();
  await page.getByLabel(/full name/i).fill('Mona Lee');
  await page.getByRole('textbox', { name: /email address/i }).fill('mona.lee@example.com');

  await page.getByRole('button', { name: /review booking/i }).click();
  await page.getByRole('button', { name: /confirm booking/i }).click();
  await expect(page.getByRole('heading', { name: /booking request received/i })).toBeVisible();

  await page.goto('/book');
  await page.locator('button.slot-button').nth(0).click();
  await page.getByRole('button', { name: /continue to your details/i }).click();
  await page.getByLabel(/full name/i).fill('Mona Lee');
  await page.getByRole('textbox', { name: /email address/i }).fill('mona.lee@example.com');
  await page.getByRole('button', { name: /review booking/i }).click();
  await page.getByRole('button', { name: /confirm booking/i }).click();

  await expect(page.getByText(/request duplicated by same key/i)).toBeVisible();
});

test('Manage route rejects malformed IDs and missing tokens with controlled messaging', async ({ page }) => {
  await page.goto('/book/manage/invalid-id');
  await expect(page.getByText(/secure booking link is incomplete/i)).toBeVisible();

  await page.route('**/api/bookings/*/manage?*', (route) => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'not_found',
          message: 'Booking not found or token invalid',
          request_id: 'edge-req',
        },
      }),
    });
  });

  const fakeId = '123e4567-e89b-12d3-a456-426614174000';
  await page.goto(`/book/manage/${fakeId}?token=bad-token`);
  await expect(page.getByText(/booking not found or token invalid/i)).toBeVisible();
});
