import { expect, test } from '@playwright/test';
import { buildEmailNotificationContent, buildSmsNotificationText, notificationSubjectFor } from '@/lib/notifications/templates';
import type { NotificationKind } from '@/lib/notifications/templates';

test('Email subject and body templates include required fields for all kinds', () => {
  const input = {
    booking_id: 'NN-TEST-0001',
    kind: 'confirm' as NotificationKind,
    recipient: 'client@example.com',
    timezone: 'America/Toronto',
    start_at_utc: new Date('2026-07-30T12:00:00.000Z').toISOString(),
    reference_code: 'NN-2026-TEST',
    service_type: 'free-15-min-call',
  };

  for (const kind of ['confirm', 'reminder_24h', 'reminder_1h', 'cancel', 'reschedule'] as NotificationKind[]) {
    const payload = { ...input, kind };
    const email = buildEmailNotificationContent(payload);
    const sms = buildSmsNotificationText(payload);

    expect(email.subject).toBe(notificationSubjectFor(kind));
    expect(email.html).toContain(payload.booking_id);
    expect(email.html).toContain(payload.reference_code);
    expect(email.html).toContain(payload.timezone);
    expect(sms).toContain(payload.booking_id);
    expect(sms).toContain(payload.timezone);
    expect(sms).toContain(payload.reference_code);
  }
});

test('SMS texts stay transport-safe and include required tokens', () => {
  const payload = {
    booking_id: 'NN-TEST-0001',
    kind: 'reminder_1h' as NotificationKind,
    recipient: '+14165551234',
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
