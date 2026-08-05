import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { rescheduleBooking } from '@/lib/booking';
import { errorOut, extractRequestId, success } from '@/lib/api';

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());
  try {
    const body = await request.json();
    const booking = await rescheduleBooking(params.bookingId, body);
    return NextResponse.json(success(requestId, { booking_id: booking.id, status: booking.status, start_at_utc: booking.startAtUtc }), { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'Invalid reschedule request'), { status: 422 });
    }
    const status = (err as { status?: number }).status ?? 400;
    const code = (err as { code?: string }).code ?? 'reschedule_error';
    return NextResponse.json(errorOut(requestId, code, (err as Error).message || 'Unable to reschedule booking'), { status });
  }
}
