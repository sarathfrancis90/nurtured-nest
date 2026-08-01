#!/usr/bin/env node

const fs = require('fs');

const samplePayload = {
  booking_id: 'NN-LIVE-TEST',
  kind: 'confirm',
  recipient: process.env.NOTIFICATION_TEST_RECIPIENT || 'qa-notify-test@example.com',
  timezone: 'America/Toronto',
  start_at_utc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  reference_code: 'NN-2026-LIVE',
  service_type: 'free-15-min-call',
};

function formatStartTime(startAtUtc, timezone) {
  const date = new Date(startAtUtc);
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date);
}

function buildEmailNotificationContent(input) {
  const subject = 'Your consultation is confirmed';
  const startsAt = formatStartTime(input.start_at_utc, input.timezone);
  const html = [
    '<div>',
    `<h2>Booking ${input.booking_id} is confirmed</h2>`,
    `<p>Reference ${input.reference_code || 'N/A'}</p>`,
    `<p>Starts: ${startsAt}</p>`,
    `<p>Timezone: ${input.timezone}</p>`,
    '</div>',
  ].join('');
  return { subject, html };
}

function buildSmsNotificationText(input) {
  const startsAt = formatStartTime(input.start_at_utc, input.timezone);
  return `Your consultation is confirmed • Booking ${input.booking_id} • ${startsAt} (${input.timezone})`;
}

function isProviderConfigured() {
  const hasEmail = !!process.env.RESEND_API_KEY;
  const hasSms = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM &&
    process.env.TWILIO_TEST_TO
  );

  return { hasEmail, hasSms };
}

async function testEmail() {
  const config = isProviderConfigured();
  const email = buildEmailNotificationContent(samplePayload);

  if (!config.hasEmail) {
    console.log('[notify-live] email skipped: RESEND_API_KEY not set');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'noreply@nurturednest.ca',
      to: [samplePayload.recipient],
      subject: email.subject,
      html: email.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`[notify-live] email send failed: ${response.status} ${text}`);
    return;
  }

  const json = await response.json();
  console.log(`[notify-live] email send accepted: ${json.id || 'ok'}`);
}

async function testSms() {
  const config = isProviderConfigured();
  if (!config.hasSms) {
    console.log('[notify-live] sms skipped: Twilio test config not fully set');
    return;
  }

  const body = buildSmsNotificationText(samplePayload);
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  const to = process.env.TWILIO_TEST_TO;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: from,
      To: to,
      Body: body,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`[notify-live] sms send failed: ${response.status} ${text}`);
    return;
  }

  const json = await response.json();
  console.log(`[notify-live] sms send accepted: ${json.sid || json.status || 'ok'}`);
}

(async () => {
  const hasAnyConfig = isProviderConfigured();
  if (!hasAnyConfig.hasEmail && !hasAnyConfig.hasSms) {
    console.log('[notify-live] skipped: no notification provider credentials configured.');
    return;
  }

  await testEmail();
  await testSms();

  const template = {
    email: buildEmailNotificationContent(samplePayload),
    sms: buildSmsNotificationText(samplePayload),
  };
  fs.writeFileSync(
    '.notify-live-last-run.json',
    `${JSON.stringify(
      {
        sentAt: new Date().toISOString(),
        emailEnabled: hasAnyConfig.hasEmail,
        smsEnabled: hasAnyConfig.hasSms,
        emailSubject: template.email.subject,
        smsLength: template.sms.length,
      },
      null,
      2,
    )}\n`,
  );

  console.log('[notify-live] payload audit written to .notify-live-last-run.json');
})();
