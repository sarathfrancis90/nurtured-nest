import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createBooking } from '@/lib/booking';
import { errorOut, success, extractRequestId } from '@/lib/api';

async function readJson(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());
  const ipAddress = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown';

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json(errorOut(requestId, 'invalid_json', 'Request body must be valid JSON'), {
      status: 400,
    });
  }

  try {
    const result = await createBooking(body, { requestId, ipAddress });

    const manageLink = `${process.env.APP_URL || 'http://localhost:3000'}/book/manage/${result.booking.id}?token=${result.manageToken}`;

    return NextResponse.json(
      success(requestId, {
        booking_id: result.booking.id,
        reference_code: result.booking.referenceCode,
        status: result.booking.status,
        starts_at_utc: result.booking.startAtUtc,
        manage_token: result.manageToken,
        confirm_token: result.confirmToken,
        client_manage_url: manageLink,
        request_id: requestId,
      }),
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(errorOut(requestId, 'validation_error', err.issues[0]?.message ?? 'Validation failed', err.issues[0]?.path?.[0]?.toString()), {
        status: 422,
      });
    }

    const status = (err as { status?: number }).status ?? 400;
    const code = (err as { code?: string }).code ?? 'booking_error';
    return NextResponse.json(errorOut(requestId, code, (err as Error).message || 'Unable to create booking'), {
      status,
    });
  }
}

export async function GET() {
  return NextResponse.json(
    errorOut(extractRequestId(new Headers(), crypto.randomUUID()), 'method_not_allowed', 'Method not allowed for GET'),
    { status: 405 }
  );
}
