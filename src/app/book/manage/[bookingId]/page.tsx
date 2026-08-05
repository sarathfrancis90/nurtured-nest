'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/lib/booking-config';
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

type ApiResponse<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

function statusCopy(status: ManageState['status']) {
  return {
    pending_confirmation: 'Needs your confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }[status];
}

export default function ManageBookingPage() {
  const params = useParams();
  const query = useSearchParams();
  const bookingId = params?.bookingId as string;
  const token = query.get('token') ?? '';
  const [payload, setPayload] = useState<ManageState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Schedule changed');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    if (!bookingId || !token) {
      setError('This secure booking link is incomplete.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/bookings/${bookingId}/manage?token=${encodeURIComponent(token)}`);
      const json = (await response.json()) as ApiResponse<ManageState>;
      if (!response.ok || !json.ok) throw new Error(json.error?.message || 'Unable to load booking');
      setPayload(json.data || null);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [bookingId, token]);

  const doAction = async (action: 'confirm' | 'cancel') => {
    if (!payload) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/bookings/${payload.booking_id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...(action === 'cancel' ? { reason: cancelReason } : {}) }),
      });
      const body = (await response.json()) as ApiResponse<{ booking_id: string; status: ManageState['status'] }>;
      if (!response.ok || !body.ok) throw new Error(body.error?.message || `Unable to ${action} booking`);
      setPayload({ ...payload, status: body.data?.status ?? payload.status });
      setCancelOpen(false);
      setNotice(action === 'cancel' ? 'Your appointment has been cancelled.' : 'Your appointment is confirmed.');
    } catch (actionError) {
      setError((actionError as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const service = SERVICES.find((item) => item.id === payload?.service_type);

  return (
    <main className="booking-flow manage-layout">
      <section className="manage-shell surface-card asymmetric-shape">
        <Link href="/book" className="text-link">← Book another consultation</Link>
        <div className="manage-header">
          <div><p className="eyebrow">Your secure booking page</p><h1>Manage your appointment.</h1><p className="booking-lede">Confirm the time, make a change, or cancel whenever you need to.</p></div>
          {payload && <span className="manage-status">{statusCopy(payload.status)}</span>}
        </div>

        {error && <p className="small-error form-error" role="alert">{error}</p>}
        {loading && !error && <p>Loading your booking…</p>}
        {notice && <p className="policy-note" role="status">{notice}</p>}

        {payload && (
          <>
            <div className="manage-details">
              <div className="manage-detail"><span>Reference</span><strong>{payload.reference_code}</strong></div>
              <div className="manage-detail"><span>Appointment</span><strong>{payload.local_label}</strong></div>
              <div className="manage-detail"><span>Service</span><strong>{service?.label ?? payload.service_type}</strong></div>
              <div className="manage-detail"><span>Contact</span><strong>{payload.client_email}</strong></div>
              <div className="manage-detail"><span>Timezone</span><strong>{payload.timezone}</strong></div>
              <div className="manage-detail"><span>Current status</span><strong>{statusCopy(payload.status)}</strong></div>
            </div>

            {payload.status === 'pending_confirmation' && <div className="policy-note"><strong>Please confirm your appointment.</strong><p>Review the details above. Confirming keeps this time reserved for you.</p></div>}
            {payload.status === 'confirmed' && <div className="policy-note"><strong>You are all set.</strong><p>Need to make a change? Reschedule or cancel below and we will update your booking record.</p></div>}
            {payload.status === 'cancelled' && <div className="policy-note"><strong>This booking is cancelled.</strong><p>When you are ready, you can choose a new time for a fresh consultation.</p></div>}
            {payload.status === 'completed' && <div className="policy-note"><strong>This appointment is complete.</strong><p>Thank you for choosing Nurtured Nest.</p></div>}

            <div className="manage-actions">
              {payload.status === 'pending_confirmation' && <button type="button" className="primary-btn signature-gradient" onClick={() => doAction('confirm')} disabled={busy}>Confirm appointment <span aria-hidden="true">→</span></button>}
              {(payload.status === 'pending_confirmation' || payload.status === 'confirmed') && <Link href={`/book/reschedule/${payload.booking_id}?token=${encodeURIComponent(token)}`} className="secondary-btn">Reschedule</Link>}
              {(payload.status === 'pending_confirmation' || payload.status === 'confirmed') && <button type="button" className="secondary-btn" onClick={() => setCancelOpen(true)} disabled={busy}>Cancel appointment</button>}
              {payload.status === 'cancelled' && <Link href="/book" className="primary-btn signature-gradient">Book a new time <span aria-hidden="true">→</span></Link>}
            </div>
            <p className="manage-note">This page is protected by your secure link. Keep it private and use it whenever your plans change.</p>
          </>
        )}
      </section>

      {cancelOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <div><p className="eyebrow">Update booking</p><h2 id="cancel-title">Cancel this appointment?</h2></div>
            <p className="manage-note">This releases the time. You can always book a new consultation later.</p>
            <label className="field-group">Reason <select className="field" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}><option>Schedule changed</option><option>No longer needed</option><option>Found another time</option><option>Other</option></select></label>
            <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setCancelOpen(false)} disabled={busy}>Keep appointment</button><button type="button" className="primary-btn signature-gradient" onClick={() => doAction('cancel')} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel it'}</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
