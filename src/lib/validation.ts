import { z } from 'zod';
import { isIsoDateValid, isTimeZoneValid } from './time';

export const serviceTypes = [
  'prenatal-consult',
  'birth-planning',
  'postpartum-consult',
  'free-15-min-call',
] as const;

export type ServiceType = (typeof serviceTypes)[number];

export const timezoneRegex = /^(?:UTC|[A-Za-z_]+(?:\/[A-Za-z0-9_+.-]+)+)$/;

export function normalizeEmailAddress(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhoneNumber(value: string): string | undefined {
  const compact = value.trim().replace(/[\s().-]/g, '');
  if (!compact) return undefined;

  const digits = compact.replace(/^00/, '').replace(/^\+/, '');
  if (!/^\d+$/.test(digits)) return undefined;

  // Nurtured Nest serves Canada first; ten-digit local numbers use NANP +1.
  const normalized = compact.startsWith('+') || compact.startsWith('00')
    ? `+${digits}`
    : digits.length === 10
      ? `+1${digits}`
      : `+${digits}`;

  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : undefined;
}

const phoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    if (!value.trim()) return undefined;
    return normalizePhoneNumber(value) ?? value;
  },
  z.string().regex(/^\+[1-9]\d{7,14}$/, 'Invalid phone number').optional(),
);

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must use YYYY-MM-DD')
  .refine((value) => isIsoDateValid(value), { message: 'date must be a valid calendar date' });

export const availabilityQuerySchema = z.object({
  service_type: z.enum(serviceTypes),
  timezone: z
    .string()
    .trim()
    .min(2, 'timezone is required')
    .max(80, 'timezone must be at most 80 characters')
    .regex(timezoneRegex, 'timezone must be a valid IANA zone')
    .refine((value) => isTimeZoneValid(value), { message: 'timezone is not supported by runtime zone database' }),
  date: dateSchema,
  duration_minutes: z.coerce.number().int().positive().max(180).default(30),
  include_weekends: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((value) => value === 'true'),
});

export const bookingCreateSchema = z.object({
  service_type: z.enum(serviceTypes),
  client_name: z
    .string()
    .trim()
    .min(2, 'client_name must be at least 2 characters')
    .max(120, 'client_name must be at most 120 characters'),
  client_email: z.string().trim().email('Invalid email address').transform(normalizeEmailAddress),
  client_phone_e164: phoneSchema,
  start_at_utc: z.string().trim().datetime({ offset: true }),
  timezone: z
    .string()
    .trim()
    .min(2, 'timezone is required')
    .max(80, 'timezone must be at most 80 characters')
    .regex(timezoneRegex, 'timezone must be a valid IANA zone')
    .refine((value) => isTimeZoneValid(value), { message: 'timezone is not supported by runtime zone database' }),
  idempotency_key: z.string().trim().min(8, 'idempotency_key must be at least 8 characters'),
  notes: z.string().trim().max(500).optional(),
  channel_preference: z.enum(['email', 'sms']).optional().default('email'),
});

export const bookingLookupSchema = z
  .object({
    email: z.string().trim().email('Invalid email address').transform(normalizeEmailAddress).optional(),
    phone: phoneSchema,
  })
  .refine((value) => Boolean(value.email || value.phone), { message: 'Enter an email address or phone number' });

export const bookingLookupVerifySchema = z
  .object({
    challenge_id: z.string().uuid('challenge_id must be UUID'),
    code: z.string().trim().regex(/^\d{6}$/, 'Enter the six-digit verification code'),
    email: z.string().trim().email('Invalid email address').transform(normalizeEmailAddress).optional(),
    phone: phoneSchema,
  })
  .refine((value) => Boolean(value.email || value.phone), { message: 'Enter the email address or phone number used to book' });

export const bookingRescheduleSchema = z.object({
  token: z.string().trim().min(12, 'token is required'),
  start_at_utc: z.string().trim().datetime({ offset: true }),
  timezone: z
    .string()
    .trim()
    .min(2, 'timezone is required')
    .max(80, 'timezone must be at most 80 characters')
    .regex(timezoneRegex, 'timezone must be a valid IANA zone')
    .refine((value) => isTimeZoneValid(value), { message: 'timezone is not supported by runtime zone database' }),
});

export const bookingIdParamSchema = z.object({
  bookingId: z.string().trim().uuid('bookingId must be UUID'),
});

export const manageQuerySchema = z.object({
  token: z.string().trim().min(12, 'token is required'),
});

export const bookingManageBodySchema = z
  .object({
    token: z.string().trim().min(12),
    reason: z.string().trim().max(500).optional(),
  })
  .passthrough();

export const bookingStatusSchema = z.object({
  status: z.enum(['pending_confirmation', 'confirmed', 'cancelled', 'completed']),
});
