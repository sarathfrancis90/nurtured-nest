import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { success, errorOut, extractRequestId } from '@/lib/api';
import { listAvailableSlots, parseAvailabilityInput } from '@/lib/booking';

export async function GET(request: NextRequest) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());

  try {
    const params = parseAvailabilityInput(new URL(request.url).searchParams);
    const slots = await listAvailableSlots(params);

    return NextResponse.json(success(requestId, { slots }), { status: 200 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        errorOut(requestId, 'validation_failed', err.issues[0]?.message ?? 'validation failed', err.issues[0]?.path?.[0]?.toString()),
        { status: 422 }
      );
    }

    return NextResponse.json(errorOut(requestId, 'availability_error', 'Failed to generate availability'), {
      status: 500,
    });
  }
}
