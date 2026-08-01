import { createHash, createHmac, randomBytes } from 'crypto';
import { DateTime } from 'luxon';
import { BookingStatus } from '@prisma/client';
import { env } from './env';
import { prisma } from './db';
import {
  availabilityQuerySchema,
  bookingCreateSchema,
  bookingIdParamSchema,
  bookingManageBodySchema,
  manageQuerySchema,
  type ServiceType,
} from './validation';
import { SERVICES, LEAD_TIME_MINUTES, MAX_DAILY_BOOKINGS, SLOT_INTERVAL_MINUTES } from './booking-config';
import {
  formatSlotLabel,
  getDayHours,
  isPast,
  minutesFromTime,
  parseLocalTimeToUtc,
} from './time';
import { scheduleForBooking } from './notifications';

export type BookingInput = ReturnType<typeof bookingCreateSchema.parse>;
export type AvailabilityInput = ReturnType<typeof availabilityQuerySchema.parse>;

type RequestLike = {
  requestId?: string;
  ipAddress?: string | null;
};

const requestWindow = new Map<string, { count: number; firstSeen: number }>();
const secret = env.APP_SHARED_SECRET;

export function assertRateLimit(subject: string, limit: number, windowMs = 60_000): void {
  const now = Date.now();
  const bucket = requestWindow.get(subject);

  if (!bucket) {
    requestWindow.set(subject, { count: 1, firstSeen: now });
    return;
  }

  if (now - bucket.firstSeen >= windowMs) {
    requestWindow.set(subject, { count: 1, firstSeen: now });
    return;
  }

  if (bucket.count >= limit) {
    const error = new Error('rate limit exceeded') as Error & { code: string; status: number };
    error.code = 'rate_limited';
    error.status = 429;
    throw error;
  }

  bucket.count += 1;
}

function normalizeForHash(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForHash);
  }

  const raw = value as Record<string, unknown>;
  const ordered = Object.keys(raw)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const nested = raw[key];
      if (nested !== undefined) {
        acc[key] = normalizeForHash(nested);
      }
      return acc;
    }, {});

  return ordered;
}

function payloadHash(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(normalizeForHash(payload))).digest('hex');
}

function issueToken(bookingId: string, seed: string, purpose: 'manage' | 'confirm'): string {
  return createHmac('sha256', secret).update(`${bookingId}:${seed}:${purpose}`).digest('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(`${secret}:${token}`).digest('hex');
}

function slotDurationMinutes(input: AvailabilityInput) {
  const service = SERVICES.find((value) => value.id === input.service_type);
  return service?.durationMinutes ?? input.duration_minutes;
}

export function deriveServiceType(value: ServiceType) {
  return SERVICES.find((service) => service.id === value);
}

export function getOpenHours(dateIso: string, timezone: string, includeWeekends: boolean): [string, string] | [] {
  const configuredHours = getDayHours(dateIso, timezone);

  if (!configuredHours.length && includeWeekends) {
    return ['09:00', '17:00'];
  }

  return configuredHours;
}

function dayBoundsUtc(dateIso: string, timezone: string) {
  const localDay = DateTime.fromISO(dateIso, { zone: timezone });
  return {
    startUtc: localDay.startOf('day').toUTC().toJSDate(),
    endUtc: localDay.endOf('day').toUTC().toJSDate(),
  };
}

export function parseAvailabilityInput(searchParams: URLSearchParams): AvailabilityInput {
  const parsed = availabilityQuerySchema.parse(Object.fromEntries(searchParams.entries()));
  return parsed;
}

function isWithinBusinessHours(startAtUtc: Date, timezone: string, serviceDurationMinutes: number): boolean {
  const startLocal = DateTime.fromJSDate(startAtUtc).setZone(timezone);
  const endLocal = startLocal.plus({ minutes: serviceDurationMinutes });
  const localDate = startLocal.toISODate();
  const open = localDate ? getDayHours(localDate, timezone) : [];

  if (!open.length) {
    return false;
  }

  const [openStart, openEnd] = open;
  const startMinute = minutesFromTime(startLocal.toFormat('HH:mm'));
  const endMinute = minutesFromTime(endLocal.toFormat('HH:mm'));
  const windowStart = minutesFromTime(openStart);
  const windowEnd = minutesFromTime(openEnd);

  return startMinute >= windowStart && endMinute <= windowEnd;
}

function isBookedAgainstExisting(existing: Array<{ startAtUtc: Date; endAtUtc: Date }>, startAtUtc: Date, endAtUtc: Date) {
  return existing.some((booking) => booking.startAtUtc < endAtUtc && booking.endAtUtc > startAtUtc);
}

export async function listAvailableSlots(input: AvailabilityInput) {
  const open = getOpenHours(input.date, input.timezone, input.include_weekends);
  if (!open.length) {
    return [];
  }

  const [startTime, endTime] = open;
  const serviceMinutes = slotDurationMinutes(input);
  const startMinutes = minutesFromTime(startTime);
  const endMinutes = minutesFromTime(endTime);

  const { startUtc, endUtc } = dayBoundsUtc(input.date, input.timezone);
  const existing = await prisma.booking.findMany({
    where: {
      status: {
        in: ['pending_confirmation', 'confirmed'],
      },
      startAtUtc: { lt: endUtc },
      endAtUtc: { gt: startUtc },
    },
    select: {
      startAtUtc: true,
      endAtUtc: true,
    },
  });

  const slots: Array<{
    start_at_utc: string;
    end_at_utc: string;
    local_label: string;
  }> = [];

  for (let total = startMinutes; total + serviceMinutes <= endMinutes; total += SLOT_INTERVAL_MINUTES) {
    const startLabel = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    const endLabel = `${String(Math.floor((total + serviceMinutes) / 60)).padStart(2, '0')}:${String((total + serviceMinutes) % 60).padStart(2, '0')}`;

    const startAtUtc = parseLocalTimeToUtc(input.date, startLabel, input.timezone);
    const endAtUtc = parseLocalTimeToUtc(input.date, endLabel, input.timezone);

    if (isPast(startAtUtc, LEAD_TIME_MINUTES)) {
      continue;
    }

    if (!isWithinBusinessHours(startAtUtc, input.timezone, serviceMinutes)) {
      continue;
    }

    if (isBookedAgainstExisting(existing, startAtUtc, endAtUtc)) {
      continue;
    }

    slots.push({
      start_at_utc: startAtUtc.toISOString(),
      end_at_utc: endAtUtc.toISOString(),
      local_label: formatSlotLabel(startAtUtc, input.timezone),
    });
  }

  return slots;
}

export async function createBooking(payload: unknown, context?: RequestLike) {
  const valid = bookingCreateSchema.parse(payload);
  const requestId = context?.requestId;
  const ipAddress = context?.ipAddress ?? 'unknown';

  const service = deriveServiceType(valid.service_type);
  if (!service) {
    const err = new Error('Unknown service_type') as Error & { code: string; status: number };
    err.code = 'invalid_service';
    err.status = 400;
    throw err;
  }

  assertRateLimit(`booking:create:${valid.client_email.toLowerCase()}`, env.RATE_LIMIT_REQUESTS_PER_MINUTE);
  assertRateLimit(`booking:create:ip:${ipAddress}`, env.RATE_LIMIT_REQUESTS_PER_MINUTE);

  const requestedStart = new Date(valid.start_at_utc);
  if (Number.isNaN(requestedStart.valueOf()) || isPast(requestedStart, LEAD_TIME_MINUTES)) {
    const err = new Error('Time must be in the future and respect the configured lead time') as Error & { code: string; status: number };
    err.code = 'invalid_time';
    err.status = 400;
    throw err;
  }

  const serviceDurationMinutes = service.durationMinutes;
  if (serviceDurationMinutes <= 0) {
    const err = new Error('Invalid service configuration') as Error & { code: string; status: number };
    err.code = 'invalid_service_config';
    err.status = 500;
    throw err;
  }

  if (!isWithinBusinessHours(requestedStart, valid.timezone, serviceDurationMinutes)) {
    const err = new Error('Requested slot is outside operating hours') as Error & { code: string; status: number };
    err.code = 'outside_business_hours';
    err.status = 422;
    throw err;
  }

  const localDate = DateTime.fromJSDate(requestedStart).setZone(valid.timezone).toISODate();
  if (!localDate) {
    const err = new Error('Invalid booking date') as Error & { code: string; status: number };
    err.code = 'invalid_time';
    err.status = 422;
    throw err;
  }

  const requestedEnd = new Date(requestedStart.getTime() + serviceDurationMinutes * 60_000);
  const { startUtc, endUtc } = dayBoundsUtc(localDate, valid.timezone);

  const existing = await prisma.bookingIdempotency.findUnique({
    where: { key: valid.idempotency_key },
    include: { booking: true },
  });

  if (existing) {
    const conflictKey = payloadHash(valid);
    if (existing.payloadHash !== conflictKey) {
      const err = new Error('Idempotency key conflict') as Error & { code: string; status: number };
      err.code = 'idempotency_conflict';
      err.status = 409;
      throw err;
    }

    const recovered = await prisma.booking.findUnique({ where: { id: existing.bookingId } });
    if (!recovered) {
      const err = new Error('Reference booking missing') as Error & { code: string; status: number };
      err.code = 'orphan_idempotency';
      err.status = 500;
      throw err;
    }

    return {
      booking: recovered,
      manageToken: issueToken(recovered.id, recovered.tokenSeed, 'manage'),
      confirmToken: issueToken(recovered.id, recovered.tokenSeed, 'confirm'),
      requestId,
    };
  }

  const existingForDay = await prisma.booking.count({
    where: {
      status: {
        in: ['pending_confirmation', 'confirmed'],
      },
      startAtUtc: {
        gte: startUtc,
        lte: endUtc,
      },
    },
  });

  if (existingForDay >= MAX_DAILY_BOOKINGS) {
    const err = new Error('Daily capacity exceeded') as Error & { code: string; status: number };
    err.code = 'capacity_exhausted';
    err.status = 409;
    throw err;
  }

  const existingOverlap = await prisma.booking.findFirst({
    where: {
      status: {
        in: ['pending_confirmation', 'confirmed'],
      },
      startAtUtc: { lt: requestedEnd },
      endAtUtc: { gt: requestedStart },
    },
  });

  if (existingOverlap) {
    const err = new Error('Slot is no longer available') as Error & { code: string; status: number };
    err.code = 'slot_unavailable';
    err.status = 409;
    throw err;
  }

  const tokenSeed = randomBytes(16).toString('hex');
  const requestedPayloadHash = payloadHash(valid);

  return prisma.$transaction(async (tx) => {
    const createdBooking = await tx.booking.create({
      data: {
        referenceCode: `NN-${DateTime.now().toFormat('yyyyMMdd')}-${tokenSeed}`,
        serviceType: valid.service_type,
        clientName: valid.client_name,
        clientEmail: valid.client_email,
        clientPhoneE164: valid.client_phone_e164 ?? null,
        timezone: valid.timezone,
        status: BookingStatus.pending_confirmation,
        startAtUtc: requestedStart,
        endAtUtc: requestedEnd,
        notes: valid.notes ?? null,
        channelPreference: valid.channel_preference,
        tokenSeed,
      },
    });

    await tx.bookingIdempotency.create({
      data: {
        key: valid.idempotency_key,
        payloadHash: requestedPayloadHash,
        bookingId: createdBooking.id,
      },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId: createdBooking.id,
        event: 'booking_created',
        actorType: 'client',
        actorIdentifier: valid.client_email,
        ipAddress,
        requestId,
        meta: {
          source: 'self-serve-booking',
        },
      },
    });

    const notifications = scheduleForBooking(
      {
        id: createdBooking.id,
        clientEmail: createdBooking.clientEmail,
        clientPhoneE164: createdBooking.clientPhoneE164,
        referenceCode: createdBooking.referenceCode,
        serviceType: createdBooking.serviceType,
        startAtUtc: createdBooking.startAtUtc.toISOString(),
        timezone: createdBooking.timezone,
      },
      valid.channel_preference,
    );

    if (notifications.length) {
      await tx.bookingNotificationOutbox.createMany({
        data: notifications,
      });
    }

    return {
      booking: createdBooking,
      manageToken: issueToken(createdBooking.id, tokenSeed, 'manage'),
      confirmToken: issueToken(createdBooking.id, tokenSeed, 'confirm'),
      requestId,
    };
  }, { maxWait: 10000, timeout: 12000 });
}

export async function getBookingForManage(bookingId: string, token: string) {
  bookingIdParamSchema.parse({ bookingId });
  manageQuerySchema.parse({ token });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return null;
  }

  const manageToken = issueToken(booking.id, booking.tokenSeed, 'manage');
  const confirmToken = issueToken(booking.id, booking.tokenSeed, 'confirm');

  if (token !== manageToken && token !== confirmToken) {
    return null;
  }

  return booking;
}

export async function updateBookingStatus(bookingId: string, body: unknown, action: 'confirm' | 'cancel') {
  const parsed = bookingManageBodySchema.parse(body);
  manageQuerySchema.parse({ token: parsed.token });
  bookingIdParamSchema.parse({ bookingId });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    const err = new Error('Booking not found') as Error & { code: string; status: number };
    err.code = 'not_found';
    err.status = 404;
    throw err;
  }

  const tokenForManage = issueToken(booking.id, booking.tokenSeed, 'manage');
  const tokenForConfirm = issueToken(booking.id, booking.tokenSeed, 'confirm');

  if (parsed.token !== tokenForManage && parsed.token !== tokenForConfirm) {
    const err = new Error('Token invalid') as Error & { code: string; status: number };
    err.code = 'invalid_token';
    err.status = 403;
    throw err;
  }

  if (action === 'confirm') {
    if (booking.status === BookingStatus.confirmed) {
      return booking;
    }

    if (booking.status === BookingStatus.cancelled || booking.status === BookingStatus.completed) {
      const err = new Error('Booking cannot be confirmed in its current state') as Error & { code: string; status: number };
      err.code = 'invalid_state';
      err.status = 409;
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.confirmed },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId,
          event: 'booking_confirmed',
          actorType: 'client',
          actorIdentifier: booking.clientEmail,
          ipAddress: null,
          requestId: null,
          meta: {
            confirmMethod: 'token',
          },
        },
      });

      return updated;
    });
  }

  if (action === 'cancel') {
    if (booking.status === BookingStatus.cancelled) {
      return booking;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.cancelled,
          cancellationReason: parsed.reason ?? 'client_request',
        },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId,
          event: 'booking_cancelled',
          actorType: 'client',
          actorIdentifier: booking.clientEmail,
          ipAddress: null,
          requestId: null,
          meta: {
            source: parsed.reason ?? 'self_service_cancel',
          },
        },
      });

      await tx.bookingNotificationOutbox.create({
        data: {
          bookingId,
          kind: 'cancel',
          channel: booking.channelPreference,
          status: 'pending',
          payload: {
            booking_id: booking.id,
            kind: 'cancel',
            recipient: booking.channelPreference === 'sms'
              ? booking.clientPhoneE164 ?? booking.clientEmail
              : booking.clientEmail,
            channel: booking.channelPreference,
            timezone: booking.timezone,
            start_at_utc: booking.startAtUtc.toISOString(),
          },
          nextAttemptAt: new Date(),
          attemptCount: 0,
          maxAttempts: 5,
        },
      });

      return updated;
    });
  }

  const error = new Error('Unsupported action') as Error & { code: string; status: number };
  error.code = 'invalid_action';
  error.status = 400;
  throw error;
}
