import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://user:password@127.0.0.1:5432/nurtured_nest'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  APP_SHARED_SECRET: z.string().min(24).default('nurtured-nest-local-development-secret'),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(30),
  CRON_SECRET: z.string().optional(),
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@nurturednest.ca'),
  ENABLE_SMS: z
    .string()
    .optional()
    .transform((value) => value === 'true' || value === '1'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export function getSmsConfig() {
  if (!env.ENABLE_SMS || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM) {
    return null;
  }

  return {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    from: env.TWILIO_FROM,
  };
}
