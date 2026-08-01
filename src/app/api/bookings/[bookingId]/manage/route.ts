import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { manageQuerySchema } from '@/lib/validation';
import { getBookingForManage } from '@/lib/booking';
import { errorOut, success, extractRequestId } from '@/lib/api';
import { formatSlotLabel } from '@/lib/time';

export async function GET(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const parsed = manageQuerySchema.parse({ token });

    const booking = await getBookingForManage(params.bookingId, parsed.token);
    if (!booking) {
      return NextResponse.json(errorOut(requestId, 'not_found', 'Booking not found or token invalid'), {
        status: 404,
      });
    }

    return NextResponse.json(
      success(requestId, {
        booking_id: booking.id,
        reference_code: booking.referenceCode,
        status: booking.status,
        service_type: booking.serviceType,
        starts_at_utc: booking.startAtUtc,
        local_label: formatSlotLabel(booking.startAtUtc, booking.timezone),
        timezone: booking.timezone,
        client_name: booking.clientName,
        client_email: booking.clientEmail,
        channel_preference: booking.channelPreference,
      }),
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'validation error'), {
        status: 422,
      });
    }

    return NextResponse.json(
      errorOut(requestId, 'manage_error', (err as Error).message || 'Unable to load booking'),
      { status: 400 }
    );
  }
}
