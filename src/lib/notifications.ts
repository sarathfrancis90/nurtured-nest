import { env, getSmsConfig } from './env';
import { prisma } from './db';
import { MAX_RETRY_COUNT } from './booking-config';
import { buildEmailNotificationContent, buildSmsNotificationText, notificationSubjectFor } from './notifications/templates';

export type NotificationKind = 'request_received' | 'confirm' | 'reminder_24h' | 'reminder_1h' | 'cancel' | 'reschedule' | 'manage_access';
export type NotificationChannel = 'email' | 'sms';

export type BookingReminderContext = {
  id: string;
  clientEmail: string;
  clientPhoneE164?: string | null;
  referenceCode?: string;
  serviceType?: string;
  startAtUtc: string;
  timezone: string;
};

export type BookingNotificationPayload = {
  booking_id: string;
  reference_code?: string;
  service_type?: string;
  kind: NotificationKind;
  recipient: string;
  channel: NotificationChannel;
  timezone: string;
  start_at_utc: string;
  verification_code?: string;
};

function getPreferredReminderChannel(preferred: NotificationChannel, phone?: string | null): NotificationChannel {
  return preferred === 'sms' && !!phone ? 'sms' : 'email';
}

function confirmRecipient(booking: BookingReminderContext, requestedChannel: NotificationChannel): string {
  if (requestedChannel === 'sms' && booking.clientPhoneE164) {
    return booking.clientPhoneE164;
  }

  return booking.clientEmail;
}

function buildPayload(booking: BookingReminderContext, kind: NotificationKind, channel: NotificationChannel) {
  return {
    booking_id: booking.id,
    reference_code: booking.referenceCode ?? booking.id.slice(0, 8).toUpperCase(),
    service_type: booking.serviceType,
    kind,
    recipient: confirmRecipient(booking, channel),
    channel,
    timezone: booking.timezone,
    start_at_utc: booking.startAtUtc,
  } as BookingNotificationPayload;
}

function sanitizeTextChannelPayload(payload: BookingNotificationPayload): string[] {
  const missing = [];
  if (!payload.booking_id) missing.push('booking_id');
  if (!payload.kind) missing.push('kind');
  if (!payload.recipient) missing.push('recipient');
  if (!payload.channel) missing.push('channel');
  if (!payload.timezone) missing.push('timezone');
  if (!payload.start_at_utc) missing.push('start_at_utc');
  return missing;
}

export function scheduleForBooking(booking: BookingReminderContext, channelPreference: NotificationChannel) {
  const now = new Date();
  const start = new Date(booking.startAtUtc);

  const confirmChannel = getPreferredReminderChannel(channelPreference, booking.clientPhoneE164);
  const reminders: Array<{
    kind: NotificationKind;
    channel: NotificationChannel;
    when: Date;
  }> = [
    {
      kind: 'request_received',
      channel: confirmChannel,
      when: now,
    },
  ];

  const reminder24h = new Date(start.getTime() - 24 * 60 * 60_000);
  const reminder1h = new Date(start.getTime() - 60 * 60_000);

  if (reminder24h > now) {
    reminders.push({
      kind: 'reminder_24h',
      channel: confirmChannel,
      when: reminder24h,
    });
  }

  if (reminder1h > now) {
    reminders.push({
      kind: 'reminder_1h',
      channel: confirmChannel,
      when: reminder1h,
    });
  }

  return reminders.map((reminder) => ({
    bookingId: booking.id,
    kind: reminder.kind,
    channel: reminder.channel,
    status: 'pending' as const,
    payload: buildPayload(booking, reminder.kind, reminder.channel),
    nextAttemptAt: reminder.when,
    attemptCount: 0,
    maxAttempts: MAX_RETRY_COUNT,
  }));
}

type NotificationSendResult = {
  ok: boolean;
  providerId?: string;
  error?: string;
};

async function sendEmail(payload: BookingNotificationPayload): Promise<NotificationSendResult> {
  if (!payload.recipient) {
    return { ok: false, error: 'email_recipient_missing' };
  }

  const invalidFields = sanitizeTextChannelPayload(payload);
  if (invalidFields.length) {
    return { ok: false, error: `email_invalid_payload:${invalidFields.join(',')}` };
  }

  const emailSubject = notificationSubjectFor(payload.kind);

  if (!env.RESEND_API_KEY) {
    if (env.APP_ENV === 'test' || env.APP_ENV === 'development') {
      return { ok: true, providerId: 'dev-simulated' };
    }

    return { ok: false, error: 'email_provider_missing' };
  }

  const built = buildEmailNotificationContent(payload);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.recipient],
      subject: emailSubject,
      html: built.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, error: `resend_${response.status}: ${text}` };
  }

  const result = (await response.json()) as { id?: string };
  return { ok: true, providerId: result.id };
}

async function sendSms(payload: BookingNotificationPayload): Promise<NotificationSendResult> {
  const invalidFields = sanitizeTextChannelPayload(payload);
  if (invalidFields.length) {
    return { ok: false, error: `sms_invalid_payload:${invalidFields.join(',')}` };
  }

  if (!payload.recipient) {
    return { ok: false, error: 'sms_recipient_missing' };
  }

  const smsConfig = getSmsConfig();
  if (!smsConfig) {
    if (env.APP_ENV === 'test' || env.APP_ENV === 'development') {
      return { ok: true, providerId: 'dev-simulated' };
    }

    return { ok: false, error: 'sms_provider_missing' };
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${smsConfig.accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${smsConfig.accountSid}:${smsConfig.authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: smsConfig.from,
      To: payload.recipient,
      Body: buildSmsNotificationText(payload),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, error: `twilio_${response.status}: ${text}` };
  }

  const result = (await response.json()) as { sid?: string };
  return { ok: true, providerId: result.sid };
}

export async function sendNotification(payload: BookingNotificationPayload): Promise<NotificationSendResult> {
  if (payload.channel === 'email') {
    return sendEmail(payload);
  }

  if (payload.channel === 'sms') {
    return sendSms(payload);
  }

  return { ok: false, error: 'unknown_channel' };
}

function nextRetryDelay(attemptCount: number): number {
  if (attemptCount <= 1) {
    return 1;
  }

  return Math.min(120, 2 ** (attemptCount - 1));
}

export async function processNotificationQueue(): Promise<{ processed: number; succeeded: number; failed: number; dead: number }> {
  const due = await prisma.bookingNotificationOutbox.findMany({
    where: {
      status: {
        in: ['pending', 'retry'],
      },
      nextAttemptAt: {
        lte: new Date(),
      },
    },
    orderBy: { nextAttemptAt: 'asc' },
    take: 100,
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let dead = 0;

  for (const row of due) {
    processed += 1;
    let result: NotificationSendResult;

    try {
      result = await sendNotification(row.payload as BookingNotificationPayload);
    } catch (sendError) {
      result = { ok: false, error: `notification_exception: ${(sendError as Error).message}` };
    }

    if (result.ok) {
      await prisma.bookingNotificationOutbox.update({
        where: { id: row.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          providerMessageId: result.providerId,
          lastError: null,
        },
      });
      succeeded += 1;
      continue;
    }

    const nextAttemptCount = row.attemptCount + 1;

    if (nextAttemptCount >= row.maxAttempts) {
      await prisma.bookingNotificationOutbox.update({
        where: { id: row.id },
        data: {
          status: 'dead',
          attemptCount: nextAttemptCount,
          lastError: result.error,
        },
      });
      dead += 1;
      failed += 1;
      continue;
    }

    await prisma.bookingNotificationOutbox.update({
      where: { id: row.id },
      data: {
        status: 'retry',
        attemptCount: nextAttemptCount,
        nextAttemptAt: new Date(Date.now() + nextRetryDelay(nextAttemptCount) * 60_000),
        lastError: result.error,
      },
    });
    failed += 1;
  }

  return {
    processed,
    succeeded,
    failed,
    dead,
  };
}
