import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { verifyBookingLookup } from '@/lib/booking';
import { errorOut, extractRequestId, success } from '@/lib/api';

export async function POST(request: NextRequest) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());
  try {
    const body = await request.json();
    const bookings = await verifyBookingLookup(body);
    return NextResponse.json(success(requestId, { bookings }), { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'Invalid verification request'), { status: 422 });
    }
    const status = (err as { status?: number }).status ?? 400;
    const code = (err as { code?: string }).code ?? 'lookup_verification_error';
    return NextResponse.json(errorOut(requestId, code, (err as Error).message || 'Unable to verify booking access'), { status });
  }
}
