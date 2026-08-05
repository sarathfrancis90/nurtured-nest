'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { SERVICES } from '@/lib/booking-config';
import CalendarWidget from '../../calendar-widget';

type Slot = { start_at_utc: string; end_at_utc: string; local_label: string };
type Booking = { booking_id: string; reference_code: string; status: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed'; service_type: string; starts_at_utc: string; local_label: string; timezone: string };
type ApiResponse<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

function displayDate(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(new Date(iso));
}

export default function RescheduleBookingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const token = useSearchParams().get('token') ?? '';
  const initialTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto', []);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!bookingId || !token) {
      setError('This secure booking link is incomplete.');
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/${bookingId}/manage?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const json = (await response.json()) as ApiResponse<Booking>;
        if (!response.ok || !json.ok) throw new Error(json.error?.message || 'Unable to load booking');
        setBooking(json.data ?? null);
        if (json.data?.timezone) setTimezone(json.data.timezone);
      })
      .catch((loadError) => setError((loadError as Error).message))
      .finally(() => setLoading(false));
  }, [bookingId, token]);

  const service = SERVICES.find((item) => item.id === booking?.service_type) ?? SERVICES[0];

  useEffect(() => {
    if (!booking) return;
    let abort = false;
    const query = new URLSearchParams({ service_type: booking.service_type, timezone, date, duration_minutes: service.durationMinutes.toString(), include_weekends: 'false' });
    setLoadingSlots(true);
    setError('');
    fetch(`/api/bookings/availability?${query.toString()}`)
      .then(async (response) => {
        const json = (await response.json()) as ApiResponse<{ slots: Slot[] }>;
        if (!response.ok || !json.ok) throw new Error(json.error?.message || 'Unable to load times');
        if (!abort) { setSlots(json.data?.slots ?? []); setSelectedSlot(''); }
      })
      .catch((loadError) => { if (!abort) { setSlots([]); setError((loadError as Error).message); } })
      .finally(() => { if (!abort) setLoadingSlots(false); });
    return () => { abort = true; };
  }, [booking, date, service.durationMinutes, timezone]);

  const saveReschedule = async () => {
    if (!selectedSlot || !booking || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/bookings/${booking.booking_id}/reschedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, start_at_utc: selectedSlot, timezone }) });
      const json = (await response.json()) as ApiResponse<{ start_at_utc: string }>;
      if (!response.ok || !json.ok) throw new Error(json.error?.message || 'That time is no longer available. Choose another slot.');
      setBooking({ ...booking, starts_at_utc: json.data?.start_at_utc ?? selectedSlot, local_label: displayDate(json.data?.start_at_utc ?? selectedSlot, timezone) });
      setComplete(true);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (complete && booking) {
    return <main className="booking-flow manage-layout"><section className="success-shell surface-card asymmetric-shape"><div className="success-mark">✦</div><p className="eyebrow">Booking updated</p><h1>Your new time is saved.</h1><p className="booking-lede">We updated {booking.reference_code} and queued a reschedule notification for you.</p><div className="success-details"><div><span>New appointment</span><strong>{displayDate(booking.starts_at_utc, timezone)}</strong></div><div><span>Service</span><strong>{service.label}</strong></div></div><div className="success-actions"><Link href={`/book/manage/${booking.booking_id}?token=${encodeURIComponent(token)}`} className="primary-btn signature-gradient">Back to my booking <span aria-hidden="true">→</span></Link><Link href="/" className="secondary-btn">Return home</Link></div></section></main>;
  }

  return (
    <main className="booking-flow manage-layout">
      <section className="manage-shell surface-card asymmetric-shape">
        <Link href={booking ? `/book/manage/${booking.booking_id}?token=${encodeURIComponent(token)}` : '/book/lookup'} className="text-link">← Back to booking</Link>
        <div className="manage-header"><div><p className="eyebrow">Change your appointment</p><h1>Choose a new time.</h1><p className="booking-lede">Your current time is {booking?.local_label ?? 'loading…'}. Select a new opening below and review it before saving.</p></div><span className="step-badge">{service.durationMinutes} minutes</span></div>
        {loading && <p>Loading your booking…</p>}
        {error && <p className="small-error form-error" role="alert">{error}</p>}
        {booking && booking.status !== 'cancelled' && booking.status !== 'completed' && <>
          <div className="timezone-row"><label className="field-group">Timezone<input className="field" aria-label="Reschedule timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} /></label><span className="field-help timezone-note">Your current time: {booking.local_label}</span></div>
          <div className="calendar-layout"><CalendarWidget value={date} onChange={setDate} timezone={timezone} /><aside className="time-panel"><div className="time-panel-heading"><div><p className="eyebrow">Available times</p><h3>{new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))}</h3></div>{loadingSlots && <span className="loading-dot">Loading</span>}</div>{!loadingSlots && slots.length === 0 && <p className="empty-state">No openings on this day. Pick another date.</p>}<div className="slot-grid">{slots.map((slot) => <button key={slot.start_at_utc} type="button" className={`slot-button ${selectedSlot === slot.start_at_utc ? 'selected' : ''}`} aria-pressed={selectedSlot === slot.start_at_utc} onClick={() => setSelectedSlot(slot.start_at_utc)}>{slot.local_label}</button>)}</div>{selectedSlot && <p className="selected-time">New time: <strong>{slots.find((slot) => slot.start_at_utc === selectedSlot)?.local_label}</strong></p>}</aside></div>
          <div className="policy-note"><strong>Before you save</strong><p>Your previous time will be released only after the new time is successfully saved. We will send the updated details to your contact channel.</p></div>
          <div className="step-actions"><Link href={`/book/manage/${booking.booking_id}?token=${encodeURIComponent(token)}`} className="secondary-btn">Keep current time</Link><button type="button" className="primary-btn signature-gradient" onClick={saveReschedule} disabled={!selectedSlot || loadingSlots || saving}>{saving ? 'Saving new time…' : 'Save new time'} <span aria-hidden="true">→</span></button></div>
        </>}
        {booking && (booking.status === 'cancelled' || booking.status === 'completed') && <div className="policy-note"><strong>This booking cannot be rescheduled.</strong><p>Book a new consultation to choose a fresh time.</p><Link href="/book" className="primary-btn signature-gradient" style={{ marginTop: '1rem', padding: '0.75rem 1rem', width: 'fit-content' }}>Book a new time</Link></div>}
      </section>
    </main>
  );
}
