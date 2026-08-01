import { PrismaClient } from '@prisma/client';

const baseUrl = process.env.APP_URL;
const cronSecret = process.env.CRON_SECRET;

if (!baseUrl || !cronSecret) {
  throw new Error('APP_URL and CRON_SECRET are required');
}

const json = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const safeBody = (body) => {
  const redact = (value, key = '') => {
    if (/token|secret|email|phone|url/i.test(key)) return '[redacted]';
    if (Array.isArray(value)) return value.map((item) => redact(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]));
    }
    return value;
  };
  return redact(body);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await json(response);
  return { response, body };
};

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;
const printOutboxDiagnostics = async (bookingId) => {
  if (!prisma || !bookingId) return;
  const rows = await prisma.bookingNotificationOutbox.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'asc' },
    select: { kind: true, channel: true, status: true, attemptCount: true, providerMessageId: true, lastError: true },
  });
  console.log('outbox diagnostics:', JSON.stringify(safeBody(rows)));
};

const assertStatus = async (label, result, expected, bookingId) => {
  if (result.response.status !== expected) {
    await printOutboxDiagnostics(bookingId);
    throw new Error(`${label} returned ${result.response.status}: ${JSON.stringify(safeBody(result.body))}`);
  }
  console.log(`${label}: ${result.response.status}`, JSON.stringify(safeBody(result.body)));
};

const runCron = async (label, bookingId) => {
  const result = await request('/api/bookings/cron', {
    method: 'POST',
    headers: { 'x-cron-secret': cronSecret },
  });
  await assertStatus(label, result, 200, bookingId);
  const summary = result.body?.data || result.body;
  if (typeof summary.failed === 'number' && summary.failed > 0) {
    await printOutboxDiagnostics(bookingId);
    throw new Error(`${label} reported failed notifications: ${JSON.stringify(safeBody(summary))}`);
  }
  return result;
};

let booking;
try {
  for (let offset = 2; offset <= 21 && !booking; offset += 1) {
    const day = new Date(Date.UTC(2026, 7, 1 + offset)).toISOString().slice(0, 10);
    const availability = await request(
      `/api/bookings/availability?service_type=free-15-min-call&timezone=America%2FToronto&date=${day}&duration_minutes=15&include_weekends=false`,
    );
    const slot = availability.body?.data?.slots?.[0];
    if (availability.response.status === 200 && slot) {
      booking = { day, slot };
    }
  }

  if (!booking) throw new Error('No future production slot available');
  console.log('availability:', JSON.stringify({ day: booking.day, local_label: booking.slot.local_label }));

  const created = await request('/api/bookings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      service_type: 'free-15-min-call',
      client_name: 'Production Notification QA',
      client_email: 'delivered@resend.dev',
      start_at_utc: booking.slot.start_at_utc,
      timezone: 'America/Toronto',
      idempotency_key: `production-notification-qa-${Date.now()}`,
      channel_preference: 'email',
      notes: 'Automated notification lifecycle smoke test. Final state must be cancelled.',
    }),
  });
  await assertStatus('booking create', created, 201);
  booking = { ...booking, ...created.body.data };

  const pending = await request(`/api/bookings/${booking.booking_id}/manage?token=${encodeURIComponent(booking.manage_token)}`);
  await assertStatus('manage pending read', pending, 200, booking.booking_id);
  await runCron('cron after booking create', booking.booking_id);

  const confirmed = await request(`/api/bookings/${booking.booking_id}/confirm`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: booking.confirm_token }),
  });
  await assertStatus('booking confirm', confirmed, 200, booking.booking_id);

  const confirmedRead = await request(`/api/bookings/${booking.booking_id}/manage?token=${encodeURIComponent(booking.manage_token)}`);
  await assertStatus('manage confirmed read', confirmedRead, 200, booking.booking_id);
  await runCron('cron after booking confirmation', booking.booking_id);

  const cancelled = await request(`/api/bookings/${booking.booking_id}/cancel`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: booking.manage_token }),
  });
  await assertStatus('booking cancel', cancelled, 200, booking.booking_id);

  const cancelledRead = await request(`/api/bookings/${booking.booking_id}/manage?token=${encodeURIComponent(booking.manage_token)}`);
  await assertStatus('manage cancelled read', cancelledRead, 200, booking.booking_id);
  await runCron('cron after booking cancellation', booking.booking_id);
  console.log('Production notification lifecycle smoke passed; test booking final state is cancelled.');
} catch (error) {
  if (booking?.booking_id && booking?.manage_token) {
    await request(`/api/bookings/${booking.booking_id}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: booking.manage_token }),
    }).catch(() => undefined);
  }
  await prisma?.$disconnect();
  throw error;
}

await prisma?.$disconnect();
