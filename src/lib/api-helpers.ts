import { NextResponse } from 'next/server';

import { errorOut, extractRequestId } from './api';

export async function parseJsonOrThrow(request: Request) {
  try {
    return await request.json();
  } catch {
    const requestId = extractRequestId(request.headers, crypto.randomUUID());
    return NextResponse.json(errorOut(requestId, 'invalid_json', 'Request body must be valid JSON'), {
      status: 400,
    });
  }
}
