'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/lib/booking-config';
import type { ServiceType } from '@/lib/validation';
import CalendarWidget from './calendar-widget';

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; field?: string };
};

type Slot = {
  start_at_utc: string;
  end_at_utc: string;
  local_label: string;
};

type BookingResponse = {
  booking_id: string;
  reference_code: string;
  status: string;
  client_manage_url: string;
  manage_token: string;
  starts_at_utc: string;
};

type Step = 1 | 2 | 3 | 4;

type BookingFormErrors = Partial<Record<'client_name' | 'client_email' | 'client_phone_e164', string>>;

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\+?[1-9]\d{7,15}$/;

function displayDate(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(new Date(iso));
}
export default function BookingPage() {
  const initialTimezone = useMemo(() => {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto';
    }
    return 'America/Toronto';
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<ServiceType>(SERVICES[0].id);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [timezone, setTimezone] = useState(initialTimezone);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<BookingFormErrors>({});
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone_e164: '',
    channel_preference: 'email',
    notes: '',
  });
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const selectedService = SERVICES.find((service) => service.id === serviceType) ?? SERVICES[0];
  const selectedSlotDetails = slots.find((slot) => slot.start_at_utc === selectedSlot);

  useEffect(() => {
    let abort = false;
    const query = new URLSearchParams({
      service_type: serviceType,
      timezone,
      date,
      duration_minutes: selectedService.durationMinutes.toString(),
      include_weekends: 'false',
    });

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const response = await fetch(`/api/bookings/availability?${query.toString()}`);
        const payload = (await response.json()) as ApiResponse<{ slots: Slot[] }>;
        if (!payload.ok) throw new Error(payload.error?.message || 'Unable to load times');
        if (!abort) {
          setSlots(payload.data?.slots ?? []);
          setSelectedSlot('');
        }
      } catch (loadErr) {
        if (!abort) {
          setSlots([]);
          setSelectedSlot('');
          setError((loadErr as Error).message);
        }
      } finally {
        if (!abort) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => { abort = true; };
  }, [date, selectedService.durationMinutes, serviceType, timezone]);

  const validateContact = () => {
    const nextErrors: BookingFormErrors = {};
    if (!form.client_name.trim() || form.client_name.trim().length < 2) nextErrors.client_name = 'Please enter your full name.';
    if (!emailRegex.test(form.client_email.trim())) nextErrors.client_email = 'Please provide a valid email address.';
    if (form.client_phone_e164 && !phoneRegex.test(form.client_phone_e164.trim())) nextErrors.client_phone_e164 = 'Use a complete phone number, for example +14165551234.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const continueFromDate = () => {
    if (!selectedSlot) {
      setError('Choose an available time to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const continueToReview = () => {
    if (!validateContact()) return;
    setError('');
    setStep(3);
  };

  const submitBooking = async () => {
    if (!selectedSlot || !validateContact() || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: serviceType,
          client_name: form.client_name,
          client_email: form.client_email,
          client_phone_e164: form.client_phone_e164 || undefined,
          start_at_utc: selectedSlot,
          timezone,
          idempotency_key: idempotencyKey,
          notes: form.notes || undefined,
          channel_preference: form.channel_preference,
        }),
      });
      const payload = (await response.json()) as ApiResponse<BookingResponse>;
      if (!response.ok || !payload.ok) {
        setError(payload.error?.message || 'This time is no longer available. Please choose another slot.');
        if (payload.error?.code === 'slot_unavailable' || payload.error?.code === 'duplicate_booking') setStep(1);
        return;
      }
      setBooking(payload.data as BookingResponse);
      setStep(4);
    } catch (submitErr) {
      setError((submitErr as Error).message || 'Unable to submit your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4 && booking) {
    return <BookingSuccess booking={booking} timezone={timezone} />;
  }

  return (
    <main className="booking-flow">
      <section className="booking-hero">
        <div>
          <p className="eyebrow">Nurtured Nest appointments</p>
          <h1>Book a calm, connected conversation.</h1>
          <p className="booking-lede">Choose a time that works for you, review every detail before it is saved, and manage your appointment from one secure page.</p>
        </div>
        <div className="booking-trust-card">
          <span className="trust-mark">✦</span>
          <div>
            <strong>Simple and private</strong>
            <p>We will send your booking details to your email and keep your secure manage link ready.</p>
          </div>
        </div>
      </section>

      <section className="booking-shell surface-card asymmetric-shape">
        <nav aria-label="Booking progress" className="booking-progress">
          {[['1', 'Choose a time'], ['2', 'Your details'], ['3', 'Review'], ['4', 'Complete']].map(([number, label], index) => (
            <div key={number} className={`progress-step ${step >= index + 1 ? 'active' : ''} ${step === index + 1 ? 'current' : ''}`}>
              <span>{number}</span><strong>{label}</strong>
            </div>
          ))}
        </nav>

        {step === 1 && (
          <div className="booking-step fade-up">
            <div className="step-heading">
              <div>
                <p className="eyebrow">Step 1 of 4</p>
                <h2>Find a time that feels right.</h2>
              </div>
              <span className="step-badge">{selectedService.durationMinutes} minutes</span>
            </div>

            <label className="field-group">
              Consultation type
              <select className="field" value={serviceType} onChange={(event) => setServiceType(event.target.value as ServiceType)}>
                {SERVICES.map((service) => <option key={service.id} value={service.id}>{service.label}</option>)}
              </select>
              <span className="field-help">{selectedService.description}</span>
            </label>

            <div className="timezone-row">
              <label className="field-group">
                Your timezone
                <input className="field" value={timezone} onChange={(event) => setTimezone(event.target.value)} aria-label="Your timezone" />
              </label>
              <span className="field-help timezone-note">Times update automatically for your timezone.</span>
            </div>

            <div className="calendar-layout">
              <CalendarWidget value={date} onChange={setDate} timezone={timezone} />
              <aside className="time-panel" aria-live="polite">
                <div className="time-panel-heading">
                  <div>
                    <p className="eyebrow">Available times</p>
                    <h3>{new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))}</h3>
                  </div>
                  {loadingSlots && <span className="loading-dot" aria-label="Loading times">Loading</span>}
                </div>
                {!loadingSlots && slots.length === 0 && <p className="empty-state">No openings on this day. Choose another date to see more times.</p>}
                <div className="slot-grid">
                  {slots.map((slot) => (
                    <button key={slot.start_at_utc} type="button" className={`slot-button ${selectedSlot === slot.start_at_utc ? 'selected' : ''}`} aria-pressed={selectedSlot === slot.start_at_utc} onClick={() => setSelectedSlot(slot.start_at_utc)}>
                      {slot.local_label}
                    </button>
                  ))}
                </div>
                {selectedSlotDetails && <p className="selected-time">Selected: <strong>{selectedSlotDetails.local_label}</strong></p>}
              </aside>
            </div>

            <div className="step-actions">
              <Link href="/book/lookup" className="text-link">Already have a booking? Find it</Link>
              <button className="primary-btn signature-gradient" type="button" onClick={continueFromDate} disabled={loadingSlots || !slots.length}>Continue to your details <span aria-hidden="true">→</span></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step fade-up">
            <div className="step-heading">
              <div><p className="eyebrow">Step 2 of 4</p><h2>Tell us how to reach you.</h2></div>
              <span className="step-badge">Your information</span>
            </div>
            <div className="booking-summary-strip"><strong>{selectedService.label}</strong><span>{selectedSlotDetails?.local_label}</span><button type="button" className="text-button" onClick={() => setStep(1)}>Change time</button></div>
            <div className="form-grid">
              <label className="field-group">Full name<input className="field" autoComplete="name" value={form.client_name} onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))} aria-invalid={Boolean(formErrors.client_name)} required />{formErrors.client_name && <span className="small-error">{formErrors.client_name}</span>}</label>
              <label className="field-group">Email address<input type="email" className="field" autoComplete="email" value={form.client_email} onChange={(event) => setForm((current) => ({ ...current, client_email: event.target.value }))} aria-invalid={Boolean(formErrors.client_email)} required />{formErrors.client_email && <span className="small-error">{formErrors.client_email}</span>}</label>
              <label className="field-group">Phone number <span className="optional-label">optional</span><input className="field" type="tel" inputMode="tel" autoComplete="tel" value={form.client_phone_e164} onChange={(event) => setForm((current) => ({ ...current, client_phone_e164: event.target.value }))} aria-invalid={Boolean(formErrors.client_phone_e164)} placeholder="+1 416 555 1234" />{formErrors.client_phone_e164 && <span className="small-error">{formErrors.client_phone_e164}</span>}</label>
              <label className="field-group">Preferred updates<select className="field" value={form.channel_preference} aria-label="Preferred update channel" onChange={(event) => setForm((current) => ({ ...current, channel_preference: event.target.value }))}><option value="email">Email</option><option value="sms">SMS</option></select><span className="field-help">Email is always used for your secure booking link.</span></label>
              <label className="field-group full-width">Anything you would like us to know? <span className="optional-label">optional</span><textarea className="field" rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="A little context helps us make the conversation useful." /></label>
            </div>
            <div className="step-actions"><button type="button" className="secondary-btn" onClick={() => setStep(1)}>← Back</button><button type="button" className="primary-btn signature-gradient" onClick={continueToReview}>Review booking <span aria-hidden="true">→</span></button></div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step fade-up">
            <div className="step-heading"><div><p className="eyebrow">Step 3 of 4</p><h2>Review before you confirm.</h2></div><span className="step-badge">Nothing is saved yet</span></div>
            <p className="review-intro">Take a moment to check the appointment, your contact details, and the cancellation policy.</p>
            <div className="review-grid">
              <article className="review-card"><div className="review-card-title"><span className="review-icon">◷</span><div><p className="eyebrow">Appointment</p><h3>{selectedService.label}</h3></div></div><dl><div><dt>Date &amp; time</dt><dd>{selectedSlotDetails ? displayDate(selectedSlotDetails.start_at_utc, timezone) : 'Choose a time'}</dd></div><div><dt>Duration</dt><dd>{selectedService.durationMinutes} minutes</dd></div><div><dt>Timezone</dt><dd>{timezone}</dd></div></dl><button type="button" className="text-button" onClick={() => setStep(1)}>Edit appointment</button></article>
              <article className="review-card"><div className="review-card-title"><span className="review-icon">♡</span><div><p className="eyebrow">Contact</p><h3>{form.client_name}</h3></div></div><dl><div><dt>Email</dt><dd>{form.client_email}</dd></div>{form.client_phone_e164 && <div><dt>Phone</dt><dd>{form.client_phone_e164}</dd></div>}<div><dt>Updates</dt><dd>{form.channel_preference === 'sms' ? 'Email + SMS' : 'Email'}</dd></div></dl><button type="button" className="text-button" onClick={() => setStep(2)}>Edit details</button></article>
            </div>
            <div className="policy-note"><strong>Cancellation &amp; changes</strong><p>You can cancel or reschedule from your secure booking page. Please make changes as early as possible so the time can be offered to another family.</p></div>
            <div className="step-actions"><button type="button" className="secondary-btn" onClick={() => setStep(2)} disabled={isSubmitting}>← Back</button><button type="button" className="primary-btn signature-gradient" onClick={submitBooking} disabled={isSubmitting}>{isSubmitting ? 'Saving your request…' : 'Confirm booking'} <span aria-hidden="true">→</span></button></div>
          </div>
        )}

        <div role="status" aria-live="polite">{error && <p className="small-error form-error">{error}</p>}</div>
      </section>
    </main>
  );
}

function BookingSuccess({ booking, timezone }: { booking: BookingResponse; timezone: string }) {
  return (
    <main className="booking-flow">
      <section className="success-shell surface-card asymmetric-shape">
        <div className="success-mark">✦</div>
        <p className="eyebrow">Step 4 of 4 · You are all set</p>
        <h1>Booking request received.</h1>
        <p className="booking-lede">We saved your consultation request and sent the details to {booking.client_manage_url ? 'your email' : 'your contact details'}. Keep your secure manage page handy for changes.</p>
        <div className="success-details"><div><span>Reference</span><strong>{booking.reference_code}</strong></div><div><span>Appointment</span><strong>{displayDate(booking.starts_at_utc, timezone)}</strong></div><div><span>Status</span><strong className="status-pill">{booking.status === 'pending_confirmation' ? 'Awaiting confirmation' : booking.status}</strong></div></div>
        <div className="success-actions"><a href={`/book/manage/${booking.booking_id}?token=${booking.manage_token}`} className="primary-btn signature-gradient">Open my booking page <span aria-hidden="true">→</span></a><Link href="/book/lookup" className="secondary-btn">Find a booking later</Link></div>
        <p className="success-footnote">Your booking page is the place to confirm, cancel, or reschedule.</p>
      </section>
    </main>
  );
}
