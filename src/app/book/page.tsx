'use client';

import { useEffect, useMemo, useState } from 'react';
import { SERVICES } from '@/lib/booking-config';
import type { ServiceType } from '@/lib/validation';

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; field?: string };
  request_id?: string;
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
  confirm_token: string;
  starts_at_utc: string;
};

type Step = 1 | 2 | 3;

type BookingFormErrors = Partial<
  Record<'client_name' | 'client_email' | 'client_phone_e164' | 'timezone' | 'service_type', string>
>;

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^\+?[1-9]\d{7,15}$/;

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

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone_e164: '',
    channel_preference: 'email',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<BookingFormErrors>({});

  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    let abort = false;
    const query = new URLSearchParams({
      service_type: serviceType,
      timezone,
      date,
      duration_minutes: SERVICES.find((service) => service.id === serviceType)?.durationMinutes?.toString() ?? '30',
      include_weekends: 'false',
    });

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const response = await fetch(`/api/bookings/availability?${query.toString()}`);
        const payload = (await response.json()) as ApiResponse<{ slots: Slot[] }>;
        if (!payload.ok) {
          throw new Error(payload.error?.message || 'Unable to load times');
        }

        if (!abort) {
          setSlots(payload.data?.slots ?? []);
          setSelectedSlot('');
        }
      } catch (loadErr) {
        if (!abort) {
          setSlots([]);
          setError((loadErr as Error).message);
        }
      } finally {
        if (!abort) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();
    return () => {
      abort = true;
    };
  }, [serviceType, timezone, date]);

  const handleDateChange = (value: string) => {
    setDate(value);
  };

  const validateStep2 = () => {
    const nextErrors: BookingFormErrors = {};
    if (!form.client_name.trim() || form.client_name.trim().length < 2) {
      nextErrors.client_name = 'Name must be at least 2 characters';
    }

    if (!emailRegex.test(form.client_email)) {
      nextErrors.client_email = 'Please provide a valid email';
    }

    if (form.client_phone_e164 && !phoneRegex.test(form.client_phone_e164.trim())) {
      nextErrors.client_phone_e164 = 'Use E.164, e.g. +14165551234';
    }

    if (!timezone.trim()) {
      nextErrors.timezone = 'Timezone is required';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onNext = () => {
    if (!selectedSlot && step === 1) {
      setError('Pick one available slot');
      return;
    }

    if (step === 2 && !validateStep2()) {
      return;
    }

    setError('');
    setStep((current) => (current + 1) as Step);
  };

  const submitBooking = async () => {
    if (!selectedSlot) {
      setError('Pick one available slot before confirming.');
      return;
    }

    if (!validateStep2()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setError(payload.error?.message || 'Could not create booking');
        return;
      }

      setBooking(payload.data as BookingResponse);
      setStep(3);
    } catch (submitErr) {
      setError((submitErr as Error).message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3 && booking) {
    return <BookingSuccess booking={booking} />;
  }

  return (
    <main style={{ maxWidth: 900, width: 'calc(100% - 20px)', margin: '0 auto', padding: '1rem' }}>
      <div className="surface-card asymmetric-shape" style={{ marginTop: '1rem', padding: '1rem', display: 'grid', gap: '1rem' }}>
        <nav aria-label="Booking progress" className="text-xs" style={{ display: 'flex', gap: '0.35rem', color: 'var(--on-surface-variant)' }}>
          <span>Step 1: Time</span>
          <span aria-hidden="true" style={{ opacity: 0.45 }}>
            &gt;
          </span>
          <span>Step 2: Information</span>
          <span aria-hidden="true" style={{ opacity: 0.45 }}>
            &gt;
          </span>
          <span>Step 3: Confirmed</span>
        </nav>

        <h1 style={{ margin: 0 }}>Book your appointment</h1>
        <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>
          No calendar redirects. Book in app, get email/SMS reminders, and manage your booking with one link.
        </p>

        {step === 1 && (
          <div className="fade-up" style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.25rem' }}>
              Consultation type
              <select
                className="field"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value as ServiceType)}
              >
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label} ({service.durationMinutes}m)
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <label>Date</label>
              <input type="date" className="field" value={date} onChange={(event) => handleDateChange(event.target.value)} />
            </div>

            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <label>Timezone</label>
              <input
                className="field"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                aria-describedby="booking-timezone-help"
                aria-invalid={Boolean(formErrors.timezone)}
              />
              <p id="booking-timezone-help" style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
                Use your local IANA timezone (America/Toronto, Europe/London, UTC)
              </p>
            </div>

            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Available time
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {loadingSlots && <p>Loading available slots...</p>}
                {!loadingSlots && slots.length === 0 && <p>No slots available for this day.</p>}
                {slots.map((slot) => (
                  <button
                    key={slot.start_at_utc}
                    type="button"
                    className={`slot-button ${selectedSlot === slot.start_at_utc ? 'selected' : ''}`}
                    aria-pressed={selectedSlot === slot.start_at_utc}
                    onClick={() => setSelectedSlot(slot.start_at_utc)}
                  >
                    {slot.local_label}
                  </button>
                ))}
              </div>
            </label>

            <button
              className="primary-btn signature-gradient"
              type="button"
              onClick={onNext}
              disabled={loadingSlots || !slots.length}
              style={{ border: 'none', minHeight: 44, borderRadius: 999, padding: '0.7rem 1.2rem', color: '#fff' }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up" style={{ display: 'grid', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Your information</h2>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              Full name
              <input
                className="field"
                value={form.client_name}
                autoComplete="name"
                onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))}
                required
                aria-invalid={Boolean(formErrors.client_name)}
              />
              {formErrors.client_name && <span className="small-error">{formErrors.client_name}</span>}
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              Email address
              <input
                type="email"
                className="field"
                autoComplete="email"
                value={form.client_email}
                onChange={(event) => setForm((current) => ({ ...current, client_email: event.target.value }))}
                required
                aria-invalid={Boolean(formErrors.client_email)}
              />
              {formErrors.client_email && <span className="small-error">{formErrors.client_email}</span>}
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              Phone (optional)
              <input
                className="field"
                type="tel"
                inputMode="tel"
                value={form.client_phone_e164}
                onChange={(event) => setForm((current) => ({ ...current, client_phone_e164: event.target.value }))}
                aria-invalid={Boolean(formErrors.client_phone_e164)}
                placeholder="+14165551234"
              />
              {formErrors.client_phone_e164 && <span className="small-error">{formErrors.client_phone_e164}</span>}
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              Preferred updates
              <select
                className="field"
                value={form.channel_preference}
                aria-label="Preferred update channel"
                onChange={(event) =>
                  setForm((current) => ({ ...current, channel_preference: event.target.value as 'email' | 'sms' }))
                }
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: '0.35rem' }}>
              Notes (optional)
              <textarea
                className="field"
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                style={{ minHeight: 44, borderRadius: 999, padding: '0.7rem 1.1rem', opacity: isSubmitting ? 0.7 : 1 }}
              >
                Back
              </button>
              <button
                className="primary-btn signature-gradient"
                type="button"
                onClick={submitBooking}
                disabled={isSubmitting}
                style={{
                  minHeight: 44,
                  border: 'none',
                  borderRadius: 999,
                  padding: '0.7rem 1.1rem',
                  color: '#fff',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm booking'}
              </button>
            </div>
          </div>
        )}

        <div role="status" aria-live="polite">
          {error && <p className="small-error">{error}</p>}
        </div>
      </div>
    </main>
  );
}

function BookingSuccess({ booking }: { booking: BookingResponse }) {
  return (
    <main style={{ maxWidth: 900, width: 'calc(100% - 20px)', margin: '0 auto', padding: '1rem' }}>
      <section className="surface-card asymmetric-shape" style={{ padding: '1.2rem' }}>
        <h1>Booking submitted</h1>
        <p>Reference: {booking.reference_code}</p>
        <p>Status: {booking.status}</p>
        <p>
          Your appointment starts at: <strong>{new Date(booking.starts_at_utc).toLocaleString()}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href={`/book/manage/${booking.booking_id}?token=${booking.manage_token}`}
            className="primary-btn signature-gradient"
            style={{ textDecoration: 'none', color: '#fff', minHeight: 44, borderRadius: 999, padding: '0.7rem 1rem', width: 'fit-content' }}
          >
            Open manage page
          </a>
        </div>
      </section>
    </main>
  );
}
