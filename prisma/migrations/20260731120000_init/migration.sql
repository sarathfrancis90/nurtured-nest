-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_confirmation', 'confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ChannelPreference" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('confirm', 'reminder_24h', 'reminder_1h', 'cancel', 'reschedule');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('pending', 'retry', 'sent', 'dead');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhoneE164" TEXT,
    "timezone" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_confirmation',
    "startAtUtc" TIMESTAMP(3) NOT NULL,
    "endAtUtc" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "channelPreference" "ChannelPreference" NOT NULL DEFAULT 'email',
    "tokenSeed" TEXT NOT NULL,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingIdempotency" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingNotificationOutbox" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'pending',
    "payload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingNotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingEvent" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorIdentifier" TEXT,
    "ipAddress" TEXT,
    "requestId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityBlock" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "date" TIMESTAMP(3),
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_referenceCode_key" ON "Booking"("referenceCode");
CREATE INDEX "Booking_startAtUtc_idx" ON "Booking"("startAtUtc");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_clientEmail_idx" ON "Booking"("clientEmail");
CREATE UNIQUE INDEX "BookingIdempotency_key_key" ON "BookingIdempotency"("key");
CREATE INDEX "BookingIdempotency_createdAt_idx" ON "BookingIdempotency"("createdAt");
CREATE INDEX "BookingNotificationOutbox_status_nextAttemptAt_idx" ON "BookingNotificationOutbox"("status", "nextAttemptAt");

-- AddForeignKey
ALTER TABLE "BookingIdempotency" ADD CONSTRAINT "BookingIdempotency_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingNotificationOutbox" ADD CONSTRAINT "BookingNotificationOutbox_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
