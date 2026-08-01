'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type ManageState = {
  booking_id: string;
  reference_code: string;
  status: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed';
  service_type: string;
  starts_at_utc: string;
  local_label: string;
  timezone: string;
  client_name: string;
  client_email: string;
  channel_preference: 'email' | 'sms';
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; field?: string };
};

export default function ManageBookingPage() {
  const params = useParams();
  const query = useSearchParams();

  const bookingId = params?.bookingId as string;
  const token = query.get('token') ?? '';

  const [payload, setPayload] = useState<ManageState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!bookingId || !token) {
      setError('Missing booking token');
      return;
    }

    const response = await fetch(`/api/bookings/${bookingId}/manage?token=${encodeURIComponent(token)}`);
    const json = (await response.json()) as ApiResponse<ManageState>;

    if (!json.ok) {
      setError(json.error?.message || 'Unable to load booking');
      return;
    }

    setPayload(json.data || null);
  };

  useEffect(() => {
    refresh();
  }, [bookingId, token]);

  const doAction = async (action: 'confirm' | 'cancel') => {
    if (!payload) {
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/bookings/${payload.booking_id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const body = (await response.json()) as ApiResponse<{ booking_id: string; status: string }>;
    setBusy(false);

    if (!response.ok || !body.ok) {
      setError(body.error?.message || `Unable to ${action}`);
      return;
    }

    if (body.data?.status && payload) {
      setPayload({ ...payload, status: body.data.status as ManageState['status'] });
      return;
    }

    await refresh();
  };

  return (
    <main className="booking-flow" style={{ maxWidth: 900, width: 'calc(100% - 20px)', margin: '0 auto', padding: '1rem' }}>
      <section className="surface-card asymmetric-shape" style={{ padding: '1rem', display: 'grid', gap: '0.9rem' }}>
        <h1 style={{ margin: 0 }}>Manage booking</h1>
        <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>Manage your consultation securely with a one-time token.</p>

        {error && (
          <div role="status" aria-live="polite">
            <p className="small-error">{error}</p>
          </div>
        )}

        {!payload && !error && <p>Loading...</p>}

        {payload && (
          <>
            <p>
              <strong>Reference:</strong> {payload.reference_code}
            </p>
            <p>
              <strong>Service:</strong> {payload.service_type}
            </p>
            <p>
              <strong>Start:</strong> {payload.local_label} ({payload.timezone})
            </p>
            <p>
              <strong>Status:</strong> {payload.status}
            </p>

            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="secondary-btn"
                aria-label="Confirm booking from secure token link"
                onClick={() => doAction('confirm')}
                disabled={busy || payload.status !== 'pending_confirmation'}
                style={{ minHeight: 44, borderRadius: 999, padding: '0.6rem 1rem', cursor: 'pointer' }}
              >
                Confirm
              </button>

              <button
                type="button"
                className="primary-btn signature-gradient"
                aria-label="Cancel booking from secure token link"
                onClick={() => doAction('cancel')}
                disabled={busy || payload.status === 'cancelled'}
                style={{ minHeight: 44, borderRadius: 999, border: 0, padding: '0.6rem 1rem', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>

            <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
              We will only use this link for verification and management.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
