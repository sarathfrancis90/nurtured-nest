'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type BookingMatch = { booking_id: string; reference_code: string; status: string; service_type: string; local_label: string; timezone: string; client_manage_url: string };
type ApiResponse = { ok: boolean; data?: { challenge_id?: string; expires_in_seconds?: number; delivery_channel?: string; dev_code?: string; bookings?: BookingMatch[] }; error?: { message?: string } };

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

export default function BookingLookupPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState('email');
  const [devCode, setDevCode] = useState('');
  const [matches, setMatches] = useState<BookingMatch[] | null>(null);
  const [step, setStep] = useState<'contact' | 'verify'>('contact');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMatches(null);
    try {
      const response = await fetch('/api/bookings/lookup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email || undefined, phone: phone || undefined }) });
      const json = (await response.json()) as ApiResponse;
      if (!response.ok || !json.ok || !json.data?.challenge_id) throw new Error(json.error?.message || 'Enter an email address or phone number.');
      setChallengeId(json.data.challenge_id);
      setDeliveryChannel(json.data.delivery_channel ?? 'email');
      setDevCode(json.data.dev_code ?? '');
      setStep('verify');
    } catch (lookupError) {
      setError((lookupError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bookings/lookup/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challenge_id: challengeId, code, email: email || undefined, phone: phone || undefined }) });
      const json = (await response.json()) as ApiResponse;
      if (!response.ok || !json.ok) throw new Error(json.error?.message || 'Unable to verify that code.');
      setMatches(json.data?.bookings ?? []);
    } catch (verifyError) {
      setError((verifyError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-flow lookup-layout">
      <section className="lookup-shell surface-card asymmetric-shape">
        <Link href="/book" className="text-link">← Back to booking</Link>
        <div className="lookup-header"><div><p className="eyebrow">Secure booking access</p><h1>Find your booking page.</h1><p className="booking-lede">Use the email address or phone number you shared when booking. We will verify it before showing any appointment details.</p></div><span className="trust-mark">✦</span></div>
        {step === 'contact' && <div className="lookup-card">
          <form onSubmit={requestCode}>
            <label className="field-group">Email address<input type="email" className="field" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="sarathfrancis90@gmail.com" /></label>
            <div className="lookup-or"><span>or</span></div>
            <label className="field-group">Phone number<input type="tel" className="field" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(416) 555-1234" /></label>
            <p className="field-help">We will send a one-time code. Your booking details are never revealed from an unverified lookup.</p>
            {error && <p className="small-error" role="alert">{error}</p>}
            <button type="submit" className="primary-btn signature-gradient" disabled={loading}>{loading ? 'Sending code…' : 'Send verification code'} <span aria-hidden="true">→</span></button>
          </form>
        </div>}
        {step === 'verify' && <div className="lookup-card">
          <form onSubmit={verifyCode}>
            <p className="eyebrow">Step 2 of 2</p>
            <h2>Check your {deliveryChannel === 'sms' ? 'phone' : 'email'}.</h2>
            <p className="booking-lede">Enter the six-digit code we sent. It expires in 10 minutes and can be used once.</p>
            <label className="field-group">Verification code<input className="field verification-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" /></label>
            {devCode && <p className="field-help" data-testid="development-code">Local development code: <strong>{devCode}</strong></p>}
            {error && <p className="small-error" role="alert">{error}</p>}
            <div className="success-actions"><button type="submit" className="primary-btn signature-gradient" disabled={loading || code.length !== 6}>{loading ? 'Verifying…' : 'Verify and show bookings'} <span aria-hidden="true">→</span></button><button type="button" className="secondary-btn" onClick={() => { setStep('contact'); setCode(''); setError(''); }}>Use a different contact</button></div>
          </form>
        </div>}
        {matches && matches.length === 0 && <div className="policy-note" role="status"><strong>No matching bookings found.</strong><p>We verified the contact method, but there are no booking records for it. You can start a new consultation booking.</p><Link href="/book" className="text-link">Book a new consultation →</Link></div>}
        {matches && matches.length > 0 && <div className="lookup-results" aria-live="polite">{matches.map((match) => <article key={match.booking_id} className="lookup-result"><span>{statusLabel(match.status)}</span><strong>{match.reference_code}</strong><div>{match.local_label}</div><div>{match.timezone}</div><a href={match.client_manage_url} className="secondary-btn">Open booking page <span aria-hidden="true">→</span></a></article>)}</div>}
        <p className="manage-note">Your contact details are used only to verify and locate booking records in this self-serve flow.</p>
      </section>
    </main>
  );
}
