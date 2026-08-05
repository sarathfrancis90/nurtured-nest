import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Nurtured Nest - Pregnancy & Birth Doula Support',
  description: 'In-app consultation booking for Prenatal, Birth, and Postpartum support.',
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header
            className="liquid-glass"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 60,
              borderBottom: '1px solid rgba(188, 185, 176, 0.2)',
            }}
          >
            <div
              style={{
                maxWidth: 1120,
                margin: '0 auto',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  color: 'var(--on-surface)',
                  fontFamily: '"Noto Serif", serif',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                Nurtured Nest
              </Link>
              <nav className="hide-mobile" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link href="#services" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Services
                </Link>
                <Link href="#contact" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Contact
                </Link>
                <Link href="/book/lookup" style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Manage
                </Link>
                <Link
                  className="primary-btn signature-gradient"
                  href="/book"
                  style={{ padding: '0.5rem 1rem', borderRadius: '999px', color: '#ffffff', textDecoration: 'none' }}
                >
                  Book
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <nav className="mobile-nav glass-nav hide-desktop" aria-label="Mobile quick actions">
            <a href="/" className="text-xs" style={{ textDecoration: 'none', color: 'var(--on-surface)' }}>
              Home
            </a>
            <a href="#services" className="text-xs" style={{ textDecoration: 'none', color: 'var(--on-surface)' }}>
              Services
            </a>
            <a href="#contact" className="text-xs" style={{ textDecoration: 'none', color: 'var(--on-surface)' }}>
              Contact
            </a>
            <Link href="/book/lookup" className="text-xs" style={{ textDecoration: 'none', color: 'var(--on-surface)' }}>
              Manage
            </Link>
            <Link href="/book" className="primary-btn signature-gradient" style={{ padding: '0.35rem 0.75rem', borderRadius: 999, fontSize: '0.72rem', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              Book
            </Link>
          </nav>
        </div>
        <style>{`
          @media (min-width: 769px) {
            .mobile-nav {
              display: none !important;
            }
            .hide-desktop {
              display: none;
            }
          }
          @media (max-width: 768px) {
            .hide-mobile {
              display: none !important;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
