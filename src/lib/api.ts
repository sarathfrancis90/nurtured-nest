export type ApiOk<T> = {
  ok: true;
  data: T;
  request_id: string;
};

export type ApiErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    field?: string;
    request_id: string;
  };
};

export function success<T>(requestId: string, data: T): ApiOk<T> {
  return {
    ok: true,
    data,
    request_id: requestId,
  };
}

export function errorOut(requestId: string, code: string, message: string, field?: string): ApiErr {
  return {
    ok: false,
    error: {
      code,
      message,
      field,
      request_id: requestId,
    },
  };
}

export function extractRequestId(headers: Headers, fallback: string): string {
  const forwarded = headers.get('x-request-id');
  if (forwarded) {
    return forwarded;
  }

  return fallback;
}
