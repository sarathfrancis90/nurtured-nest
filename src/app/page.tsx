const services = [
  {
    name: 'Full Doula Support',
    bullets: [
      'Prenatal support',
      'Birth planning',
      'Emotional prep',
      'Partner guidance',
      'Birth support',
      'On-call support',
      'Continuous labor guidance',
      'Postpartum care',
      'Recovery support',
      'Newborn guidance',
    ],
  },
  {
    name: 'Birth Support Only',
    bullets: ['On-call support', 'Continuous labor guidance', '2 hours support after birth'],
  },
  {
    name: 'Prenatal Support Only',
    bullets: ['Birth planning', 'Emotional prep', 'Partner guidance', 'Comfort measures', 'Breathing techniques'],
  },
  {
    name: 'Belly Binding (Postpartum)',
    bullets: [
      'Support for postpartum alignment and recovery',
      'Gentle guidance from a caring and informed doula',
      'A warm, supportive body-care routine after birth',
    ],
  },
] as const;

const doulaBenefits = [
  'Dedicated support before, during, and after birth.',
  'Calm, compassionate guidance to help you feel grounded and supported.',
  'Breathing techniques, positioning, comfort measures, and hands-on support.',
  'Help understanding your options so you can make choices with confidence.',
  'Guidance for your partner so they feel included and empowered.',
];

const faqs = [
  {
    q: 'What does a doula do?',
    a: 'A doula provides continuous emotional, physical, and informational support during pregnancy, labor, and postpartum. I help you feel informed, reassured, and supported in your choices.',
  },
  {
    q: 'When should you hire a doula?',
    a: 'You can hire a doula at any stage of pregnancy—even early on or later in the third trimester. The earlier we connect, the more time we have to build trust and prepare together.',
  },
  {
    q: 'Do you replace my doctor or midwife?',
    a: 'No. I do not replace your doctor, midwife, or medical team. I support your team as a non-medical companion.',
  },
  {
    q: 'Do you offer postpartum support?',
    a: 'Yes. I provide emotional and practical support after birth, including feeding support, newborn confidence, and routine recovery guidance.',
  },
];

export default function HomePage() {
  return (
    <main className="fade-up" style={{ maxWidth: 1120, margin: '0 auto', padding: '1.2rem', lineHeight: 1.55 }}>
      <section
        style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '2.5rem',
          padding: '2rem',
          background: 'var(--surface-container)',
          borderRadius: '3rem 1.5rem',
          boxShadow: 'var(--ambient-shadow)',
        }}
      >
        <p style={{ margin: 0, color: 'var(--on-surface-variant)', letterSpacing: '0.12rem', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
          Pregnancy & Birth Doula Support
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.2rem)', maxWidth: 760 }}>
          Compassionate Doula support for Pregnancy and Birth
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: 'var(--on-surface-variant)', fontSize: '1.05rem' }}>
          Help your family feel calm, confident, and supported from first trimester planning through postpartum recovery.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            href="/book"
            className="primary-btn signature-gradient"
            style={{ padding: '0.75rem 1.1rem', minHeight: 44, color: '#fff', textDecoration: 'none', borderRadius: 999 }}
          >
            Book a free 15-min consultation
          </a>
          <a
            href="#services"
            className="secondary-btn"
            style={{ padding: '0.75rem 1.1rem', textDecoration: 'none', borderRadius: 999 }}
          >
            View Services
          </a>
          <a
            href="#contact"
            className="secondary-btn"
            style={{ padding: '0.75rem 1.1rem', textDecoration: 'none', borderRadius: 999 }}
          >
            Contact &amp; Appointments
          </a>
        </div>
      </section>

      <section id="services" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>Services</h2>
        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          {services.map((service, index) => (
            <article
              key={service.name}
              className="surface-card asymmetric-shape fade-up"
              style={{
                padding: '1.1rem',
                animationDelay: `${index * 80}ms`,
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: '1.45rem', marginBottom: '0.6rem' }}>{service.name}</h3>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {service.bullets.map((item) => (
                  <li key={item} style={{ marginBottom: '0.35rem', color: 'var(--on-surface-variant)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="why-hire" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.3vw, 2.2rem)' }}>Why Hire a Doula?</h2>
        <p style={{ marginBottom: '1rem', color: 'var(--on-surface-variant)' }}>
          A doula provides continuous emotional, physical, and informational support throughout your journey so you feel informed and calm.
        </p>
        <ul style={{ paddingLeft: '1.2rem' }}>
          {doulaBenefits.map((item) => (
            <li key={item} style={{ marginBottom: '0.55rem', color: 'var(--on-surface-variant)' }}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" style={{ marginBottom: '5rem' }}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: 'clamp(1.6rem, 3.3vw, 2.2rem)' }}>Contact &amp; Appointments</h2>
        <p style={{ marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>
          Use this path to book directly inside the app. You can schedule a free consultation, choose a time, and manage it from your secure link.
        </p>
        <a href="/book" className="primary-btn signature-gradient" style={{ textDecoration: 'none', padding: '0.85rem 1rem', borderRadius: 999, minHeight: 44, color: '#fff' }}>
          Open booking flow
        </a>
      </section>

      <section id="faqs" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.3vw, 2rem)' }}>FAQs</h2>
        {faqs.map((faq) => (
          <details key={faq.q} style={{ marginBottom: '0.75rem', padding: '0.65rem' }} className="surface-card asymmetric-shape">
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{faq.q}</summary>
            <p style={{ marginTop: '0.6rem', marginBottom: 0, color: 'var(--on-surface-variant)' }}>{faq.a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
