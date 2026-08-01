'use client';

import { useEffect, useState } from 'react';

export default function ThankYouPage() {
  const [bookingId, setBookingId] = useState('unknown');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setBookingId(params.get('booking_id') ?? 'unknown');
    setReference(params.get('ref') ?? '');
  }, []);

  return (
    <main className="booking-flow" style={{ maxWidth: 880, margin: '0 auto', padding: '1rem' }}>
      <section className="surface-card asymmetric-shape" style={{ padding: '1.2rem', display: 'grid', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>Thank you for booking</h1>
        <p style={{ margin: 0 }}>Your request was recorded successfully.</p>
        <p style={{ margin: 0 }}>Reference: {reference || bookingId}</p>
        <a
          href="/"
          className="primary-btn signature-gradient"
          style={{ width: 'fit-content', textDecoration: 'none', color: '#fff', padding: '0.7rem 1rem', borderRadius: 999 }}
        >
          Return home
        </a>
      </section>
    </main>
  );
}
