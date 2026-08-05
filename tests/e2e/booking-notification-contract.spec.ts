import { expect, test } from '@playwright/test';
import { buildEmailNotificationContent, buildSmsNotificationText, notificationSubjectFor } from '@/lib/notifications/templates';
import type { NotificationKind } from '@/lib/notifications/templates';

test('Email subject and body templates include required fields for all kinds', () => {
  const input = {
    booking_id: 'NN-TEST-0001',
    kind: 'confirm' as NotificationKind,
    recipient: 'client@example.com',
    channel: 'email' as const,
    timezone: 'America/Toronto',
    start_at_utc: new Date('2026-07-30T12:00:00.000Z').toISOString(),
    reference_code: 'NN-2026-TEST',
    service_type: 'free-15-min-call',
  };

  for (const kind of ['request_received', 'confirm', 'reminder_24h', 'reminder_1h', 'cancel', 'reschedule', 'manage_access'] as NotificationKind[]) {
    const payload = { ...input, kind };
    const email = buildEmailNotificationContent(payload);
    const sms = buildSmsNotificationText(payload);

    expect(email.subject).toBe(notificationSubjectFor(kind));
    expect(email.html).toContain(payload.booking_id);
    expect(email.html).toContain(payload.reference_code);
    expect(email.html).toContain(payload.timezone);
    expect(email.html).toContain('<strong>Delivery:</strong> Email');
    expect(email.html).not.toContain(payload.recipient);
    expect(sms).toContain(payload.booking_id);
    expect(sms).toContain(payload.timezone);
    expect(sms).toContain(payload.reference_code);
  }
});

test('Lookup access templates include the one-time code without exposing recipient data', () => {
  const payload = {
    booking_id: 'NN-TEST-0002',
    kind: 'manage_access' as NotificationKind,
    recipient: 'client@example.com',
    channel: 'email' as const,
    timezone: 'America/Toronto',
    start_at_utc: new Date('2026-07-30T12:00:00.000Z').toISOString(),
    verification_code: '123456',
  };
  const email = buildEmailNotificationContent(payload);
  const sms = buildSmsNotificationText(payload);
  expect(email.html).toContain('123456');
  expect(email.html).not.toContain(payload.recipient);
  expect(sms).toContain('123456');
});

test('SMS texts stay transport-safe and include required tokens', () => {
  const payload = {
    booking_id: 'NN-TEST-0001',
    kind: 'reminder_1h' as NotificationKind,
    recipient: '+14165551234',
    channel: 'sms' as const,
    timezone: 'America/Toronto',
    start_at_utc: new Date('2026-07-30T12:00:00.000Z').toISOString(),
    reference_code: 'NN-2026-TEST',
    service_type: 'free-15-min-call',
  };

  const sms = buildSmsNotificationText(payload);

  expect(sms).toContain(payload.booking_id);
  expect(sms).toContain(payload.timezone);
  expect(sms).toContain(payload.reference_code);
  expect(sms).toContain(payload.service_type);
  expect(sms.length).toBeLessThanOrEqual(160);
});
