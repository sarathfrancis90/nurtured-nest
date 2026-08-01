import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { processNotificationQueue } from '@/lib/notifications';
import { errorOut, extractRequestId, success } from '@/lib/api';

function authorizeCron(request: NextRequest) {
  if (!env.CRON_SECRET) {
    return request.headers.get('x-vercel-cron') === '1';
  }

  const authHeader = request.headers.get('authorization');
  const headerToken =
    request.headers.get('x-cron-secret') ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);
  const queryToken = new URL(request.url).searchParams.get('cron_secret');
  return headerToken === env.CRON_SECRET || queryToken === env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  const requestId = extractRequestId(request.headers, crypto.randomUUID());

  if (!authorizeCron(request)) {
    return NextResponse.json(errorOut(requestId, 'forbidden', 'Cron token missing or invalid'), { status: 403 });
  }

  const result = await processNotificationQueue();
  return NextResponse.json(success(requestId, result), { status: 200 });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
