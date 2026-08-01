export type NotificationKind = 'confirm' | 'reminder_24h' | 'reminder_1h' | 'cancel' | 'reschedule';
export type NotificationTemplateInput = {
  booking_id: string;
  kind: NotificationKind;
  recipient: string;
  channel: 'email' | 'sms';
  timezone: string;
  start_at_utc: string;
  reference_code?: string;
  service_type?: string;
};

const subjectByKind: Record<NotificationKind, string> = {
  confirm: 'Your consultation is confirmed',
  reminder_24h: 'Reminder: your consultation is in 24 hours',
  reminder_1h: 'Reminder: your consultation is in 1 hour',
  cancel: 'Your consultation has been cancelled',
  reschedule: 'Your consultation has been rescheduled',
};

const titleByKind: Record<NotificationKind, string> = {
  confirm: 'Booking request received',
  reminder_24h: 'Upcoming appointment reminder',
  reminder_1h: 'Appointment reminder',
  cancel: 'Booking update: cancelled',
  reschedule: 'Booking update: rescheduled',
};

const labelByKind: Record<NotificationKind, string> = {
  confirm: 'saved',
  reminder_24h: 'reminder',
  reminder_1h: 'reminder',
  cancel: 'status update',
  reschedule: 'reschedule',
};

function formatStartTime(startAtUtc: string, timezone: string): string {
  const parsed = new Date(startAtUtc);
  if (Number.isNaN(parsed.valueOf())) {
    return 'invalid time';
  }

  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(parsed);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character] as string;
  });
}

export function notificationSubjectFor(kind: NotificationKind): string {
  return subjectByKind[kind];
}

export function buildEmailNotificationContent(input: NotificationTemplateInput): { subject: string; html: string } {
  const safeBookingId = escapeHtml(input.booking_id);
  const subject = notificationSubjectFor(input.kind);
  const startsAt = formatStartTime(input.start_at_utc, input.timezone);
  const heading = titleByKind[input.kind];
  const deliveryLabel = input.channel === 'sms' ? 'Text message' : 'Email';
  const referenceLine = input.reference_code ? `<p><strong>Reference code:</strong> ${escapeHtml(input.reference_code)}</p>` : '';
  const serviceLine = input.service_type ? `<p><strong>Service:</strong> ${escapeHtml(input.service_type)}</p>` : '';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #393831; line-height: 1.55; max-width: 680px;">
      <h2 style="margin: 0 0 0.8rem 0; color: #2f5f78;">${heading}</h2>
      <p>Hi there,</p>
      <p>Your consultation notification (${labelByKind[input.kind]}) is ready for Booking ${safeBookingId}.</p>
      ${serviceLine}
      ${referenceLine}
      <p><strong>Starts:</strong> ${escapeHtml(startsAt)}</p>
      <p><strong>Timezone:</strong> ${escapeHtml(input.timezone)}</p>
      <p><strong>Delivery:</strong> ${deliveryLabel}</p>
      <p style="padding: 0.8rem; background: #f7f3eb; border-left: 3px solid #3e6a7e; border-radius: 4px;">
        Need help? Use your secure manage link in-app and update your booking at any time.
      </p>
      <p style="font-size: 0.9rem; color: #6d6353;">Automated message from the appointment system. Reply is not monitored.</p>
    </div>
  `.trim();

  return { subject, html };
}

export function buildSmsNotificationText(input: NotificationTemplateInput): string {
  const startsAt = formatStartTime(input.start_at_utc, input.timezone);
  const subject = notificationSubjectFor(input.kind);
  const referenceSuffix = input.reference_code ? ` ${input.reference_code}` : '';
  const serviceSuffix = input.service_type ? ` | ${input.service_type}` : '';
  return `${subject} • Booking ${input.booking_id}${referenceSuffix}${serviceSuffix} • ${startsAt} (${input.timezone})`;
}
