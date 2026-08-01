import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { bookingManageBodySchema } from '@/lib/validation';
import { updateBookingStatus } from '@/lib/booking';
import { errorOut, success, extractRequestId } from '@/lib/api';

async function readBody(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return null;
    }

    const parsed = JSON.parse(rawBody);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());

  try {
    const body = await readBody(request);
    if (!body) {
      return NextResponse.json(errorOut(requestId, 'invalid_json', 'Request body must be valid JSON'), { status: 400 });
    }

    const parsed = bookingManageBodySchema.parse(body);
    const booking = await updateBookingStatus(params.bookingId, parsed, 'cancel');

    return NextResponse.json(
      success(requestId, {
        booking_id: booking.id,
        status: booking.status,
      }),
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'validation error'), {
        status: 422,
      });
    }

    const code = (err as { code?: string }).code ?? 'cancel_error';
    const status = (err as { status?: number }).status ?? 400;

    return NextResponse.json(errorOut(requestId, code, (err as Error).message || 'Unable to cancel booking'), {
      status,
    });
  }
}
