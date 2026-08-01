import { z } from 'zod';
import { isTimeZoneValid } from './time';

export const serviceTypes = [
  'prenatal-consult',
  'birth-planning',
  'postpartum-consult',
  'free-15-min-call',
] as const;

export type ServiceType = (typeof serviceTypes)[number];

export const timezoneRegex = /^[A-Za-z_]+(?:\/[A-Za-z_+\-]+)?$|^UTC$|^Etc\/GMT[+\-]\d{1,2}$/;

export const availabilityQuerySchema = z.object({
  service_type: z.enum(serviceTypes),
  timezone: z
    .string()
    .trim()
    .min(2, 'timezone is required')
    .max(80, 'timezone must be at most 80 characters')
    .regex(timezoneRegex, 'timezone must be a valid IANA zone')
    .refine((value) => isTimeZoneValid(value), { message: 'timezone is not supported by runtime zone database' }),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  client_email: z.string().trim().email('Invalid email address'),
  client_phone_e164: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\+?[1-9]\d{7,15}$/.test(value), 'Invalid phone number'),
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
