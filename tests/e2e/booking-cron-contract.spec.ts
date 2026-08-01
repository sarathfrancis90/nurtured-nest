import { expect, test } from '@playwright/test';

test('Cron endpoint rejects unauthenticated calls', async ({ request }) => {
  const response = await request.post('/api/bookings/cron');

  expect(response.status()).toBe(403);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: false });
  expect(body.error.code).toBe('forbidden');
});

test('Cron endpoint allows Vercel cron invocation header', async ({ request }) => {
  const response = await request.post('/api/bookings/cron', {
    headers: {
      'x-vercel-cron': '1',
    },
  });

  expect(response.status()).toBe(200);
  const body = (await response.json()) as any;
  expect(body).toMatchObject({ ok: true });
});
