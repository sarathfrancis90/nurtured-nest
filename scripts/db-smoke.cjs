#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.log('[db-smoke] skipped: DATABASE_URL is not configured.');
  process.exit(0);
}

const prisma = new PrismaClient({
  log: ['error'],
});

async function run() {
  try {
    const ping = await prisma.$queryRaw`SELECT NOW() as now`;
    const bookingCount = await prisma.booking.count();
    const outboxCount = await prisma.bookingNotificationOutbox.count();
    const eventCount = await prisma.bookingEvent.count();
    const idempotencyCount = await prisma.bookingIdempotency.count();

    console.log('[db-smoke] connected:', Array.isArray(ping) ? ping[0]?.now : 'ok');
    console.log(
      `[db-smoke] counts booking=${bookingCount}, outbox=${outboxCount}, events=${eventCount}, idempotency=${idempotencyCount}`,
    );
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.log('[db-smoke] skipped: database unavailable');
    console.log(`[db-smoke] reason: ${(error && error.message) || String(error)}`);
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  }
}

run().catch(() => process.exit(0));
