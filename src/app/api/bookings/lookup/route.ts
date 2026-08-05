import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { requestBookingLookup } from '@/lib/booking';
import { errorOut, extractRequestId, success } from '@/lib/api';

export async function POST(request: NextRequest) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());
  try {
    const body = await request.json();
    const lookup = await requestBookingLookup(body, { requestId, ipAddress: request.headers.get('x-forwarded-for') });
    return NextResponse.json(success(requestId, lookup), { status: 202 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'Enter an email address or phone number'), { status: 422 });
    }
    const status = (err as { status?: number }).status ?? 400;
    const code = (err as { code?: string }).code ?? 'lookup_error';
    return NextResponse.json(errorOut(requestId, code, (err as Error).message || 'Unable to find bookings'), { status });
  }
}
