-- Notification semantics and verified self-service lookup.
ALTER TYPE "NotificationKind" ADD VALUE IF NOT EXISTS 'request_received';
ALTER TYPE "NotificationKind" ADD VALUE IF NOT EXISTS 'manage_access';

CREATE TABLE IF NOT EXISTS "BookingLookupChallenge" (
    "id" TEXT NOT NULL,
    "lookupKeyHash" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingLookupChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BookingLookupChallenge_lookupKeyHash_expiresAt_idx"
  ON "BookingLookupChallenge"("lookupKeyHash", "expiresAt");

-- The application pre-check is only an optimization. PostgreSQL owns the
-- final race-safe decision for active bookings.
CREATE EXTENSION IF NOT EXISTS btree_gist;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'booking_active_time_no_overlap'
  ) THEN
    ALTER TABLE "Booking"
      ADD CONSTRAINT "booking_active_time_no_overlap"
      EXCLUDE USING gist (
        tsrange("startAtUtc", "endAtUtc", '[)') WITH &&
      )
      WHERE ("status" IN ('pending_confirmation', 'confirmed'));
  END IF;
END $$;
